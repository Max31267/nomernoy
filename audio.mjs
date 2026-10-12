// Mechanical reel sounds synthesized locally; no audio downloads or autoplay.
export class ReelAudio {
  constructor(enabled) {
    this.enabled=enabled;this.context=null;this.master=null;this.reels=new Set();
    this.frame=0;this.lastTick=-Infinity;this.motor=null;
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)this.stopMotor();
      else if(this.reels.size)this.startMotor();
    });
    window.addEventListener('pagehide',()=>this.stopMotor());
  }
  ready(unlock=false) {
    if(!this.enabled()||document.hidden)return null;
    try {
      if(!this.context) {
        const Context=window.AudioContext||window.webkitAudioContext;
        if(!Context)return null;
        this.context=new Context();this.master=this.context.createGain();
        const limiter=this.context.createDynamicsCompressor();
        limiter.threshold.value=-15;limiter.knee.value=12;limiter.ratio.value=8;
        limiter.attack.value=.003;limiter.release.value=.08;
        this.master.gain.value=.5;this.master.connect(limiter);limiter.connect(this.context.destination);
        this.noise=this.context.createBuffer(1,Math.ceil(this.context.sampleRate*.2),this.context.sampleRate);
        const samples=this.noise.getChannelData(0);
        for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
      }
      if(unlock&&this.context.state!=='running')this.context.resume().catch(()=>{});
      return this.context;
    } catch {return null;}
  }
  setEnabled(value) {
    if(!value){
      this.stopMotor();
      if(this.context){const now=this.context.currentTime;this.master.gain.cancelScheduledValues(now);this.master.gain.setTargetAtTime(0,now,.006);}
      return;
    }
    const ctx=this.ready(true);
    if(ctx){this.master.gain.cancelScheduledValues(ctx.currentTime);this.master.gain.setTargetAtTime(.5,ctx.currentTime,.008);if(this.reels.size)this.startMotor();}
  }
  tone(frequency,duration) {
    const ctx=this.ready(true);if(!ctx)return;
    try {
      const oscillator=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;
      oscillator.type='sine';oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(.08,now+.004);
      gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
      oscillator.connect(gain);gain.connect(this.master);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
      oscillator.start(now);oscillator.stop(now+duration+.01);
    } catch {}
  }
  click(index=0,locked=false) {
    const ctx=this.ready();if(!ctx||ctx.state!=='running')return;
    try {
      const now=ctx.currentTime,duration=locked ? .085 : .025;
      const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
      source.buffer=this.noise;source.playbackRate.value=.9+index*.045;
      filter.type='bandpass';filter.frequency.value=locked?1150:2600+index*90;filter.Q.value=locked ? .6 : 1.2;
      gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(locked ? .3 : .14,now+.001);
      gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
      source.connect(filter);filter.connect(gain);gain.connect(this.master);
      source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
      source.start(now);source.stop(now+duration+.005);
      const body=ctx.createOscillator(),bodyGain=ctx.createGain();
      body.type='triangle';body.frequency.setValueAtTime(locked?240+index*24:1450+index*30,now);
      body.frequency.exponentialRampToValueAtTime(locked?95:320,now+duration);
      bodyGain.gain.setValueAtTime(locked ? .17 : .045,now);bodyGain.gain.exponentialRampToValueAtTime(.0001,now+duration);
      body.connect(bodyGain);bodyGain.connect(this.master);
      body.onended=()=>{body.disconnect();bodyGain.disconnect();};
      body.start(now);body.stop(now+duration+.005);
    } catch {}
  }
  startMotor() {
    if(this.motor||!this.reels.size)return;
    const ctx=this.ready();if(!ctx||ctx.state!=='running')return;
    try {
      const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
      source.buffer=this.noise;source.loop=true;filter.type='bandpass';filter.frequency.value=800;filter.Q.value=.6;
      gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.linearRampToValueAtTime(.025,ctx.currentTime+.06);
      source.connect(filter);filter.connect(gain);gain.connect(this.master);
      source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
      source.start();this.motor={source,filter,gain};
    } catch {}
  }
  stopMotor() {
    if(!this.motor)return;
    const {source,gain}=this.motor;this.motor=null;
    try{const now=this.context.currentTime;gain.gain.cancelScheduledValues(now);gain.gain.setTargetAtTime(.0001,now,.012);source.stop(now+.06);}catch{}
  }
  watch(animation,count,index) {
    const reel={animation,count,index,lastStep:0};this.reels.add(reel);
    this.startMotor();
    if(!this.frame)this.frame=requestAnimationFrame(now=>this.advance(now));
    let stopped=false;
    return locked=>{
      if(stopped)return;stopped=true;this.reels.delete(reel);
      if(locked)this.click(index,true);
      if(!this.reels.size){cancelAnimationFrame(this.frame);this.frame=0;this.stopMotor();this.lastTick=-Infinity;}
    };
  }
  advance(now) {
    this.frame=0;let changed=null,remaining=0;
    for(const reel of this.reels) {
      const progress=reel.animation.effect?.getComputedTiming().progress;
      if(progress===null||progress===undefined)continue;
      const step=Math.floor(Math.max(0,Math.min(1,progress))*reel.count);
      remaining=Math.max(remaining,1-progress);
      if(step>reel.lastStep){changed=reel;reel.lastStep=step;}
    }
    // One shared ratchet avoids a loud pile-up of nine simultaneous reels.
    if(changed&&now-this.lastTick>=28){this.click(changed.index);this.lastTick=now;}
    if(this.motor){const time=this.context.currentTime;this.motor.filter.frequency.setTargetAtTime(350+remaining*650,time,.04);this.motor.gain.gain.setTargetAtTime(.006+remaining*.025,time,.04);}
    else this.startMotor();
    if(this.reels.size)this.frame=requestAnimationFrame(time=>this.advance(time));
  }
}