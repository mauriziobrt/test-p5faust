import("stdfaust.lib");

// Random trigger generator (approximating Dust.kr)
dust(rate) = no.noise : abs : >(1.0 - (rate/ma.SR)) : ba.impulsify;

// Exponential random value triggered (approximating TExpRand)
texprand(lo, hi, trig) = trig : ba.sAndH(no.noise) : *(0.5) : +(0.5) 
    : \(x).(lo * pow(hi/lo, x));

// LFNoise2 approximation (smoothed noise)
lfnoise2(freq) = no.noise : fi.lowpass(3, freq) : *(2.0);

// Percussion envelope (attack/release) with range mapping
perc_env(trig) = trig : en.ar(0.01, 1.0) : *(17.0);

// Single voice of the river sound
river_voice = freq : os.osc
with {
    trigs = dust(7);
    base_freq = texprand(30, 2000, trigs);
    wobble = lfnoise2(20) * 300;
    rise = perc_env(trigs);
    freq = base_freq + wobble + rise;
};

// Six parallel voices (like the second example)
river_parallel = par(i, 1, river_voice) : /(6.0);

// Main process - select single or parallel version
process = river_parallel * 0.3;