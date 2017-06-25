'use strict';

var format = require('./');
var t = require('tape')

t('parse' t => {
	format.parse('interleaved uint8 le stereo 44100')
	// {interleaved: true, dtype: 'uint8', endianness: 'le', channels: 2, sampleRate: 44100}

	format.parse('stereo audiobuffer 96000')
	// {channels: 2, dtype: 'audiobuffer', sampleRate: 96000, interleaved: false, endianness: 'le'}

	format.parse(new AudioBuffer(null, {length: 10, numberOfChannels: 2}))
	// {channels: 2, dtype: 'audiobuffer', sampleRate: 44100, endianness: 'le', interleaved: false}

	format.parse(new Uint8ClampedArray([0, 255, 0, 255]))
	// {dtype: 'uint8'}
})

t('parse edge case', t => {

})

t('stringify', t => {
	format.stringify({channels: 2, interleaved: false})
	// 'stereo planar'

	format.stringify(new AudioBuffer(null, {length: 10}))
	// 'mono audiobuffer 44100'

	format.stringify({dtype: 'float32', endianness: 'le', interleaved: false, channels: 2}, {endianness: 'le', dtype: 'float32'})
	// 'stereo planar'
})

t('stringify edge case', t => {

})
