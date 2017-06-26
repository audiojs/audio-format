'use strict';

var format = require('./')
var t = require('tape')
var AudioBuffer = require('audio-buffer')
var ndsamples = require('ndsamples')
var ndarray = require('ndarray')

t('parse default', t => {
	t.deepEqual(
		format.parse('interleaved uint8 le stereo 44100'),
		{interleaved: true, type: 'uint8', endianness: 'le', channels: 2, sampleRate: 44100}
	)
	t.end()
})

t('parse audiobuffer', t => {
	t.deepEqual(
		format.parse('stereo audiobuffer 96000'),
		{channels: 2, type: 'audiobuffer', sampleRate: 96000, interleaved: false, endianness: 'le'}
	)
	t.end()
})

t('parse real audio buffer', t => {
	t.deepEqual(
		format.parse(new AudioBuffer(null, {length: 10, numberOfChannels: 2})),
		{channels: 2, type: 'audiobuffer', sampleRate: 44100, endianness: 'le', interleaved: false}
	)

	t.end()
})

t('parse typed array', t => {
	t.deepEqual(
		format.parse(new Uint8ClampedArray([0, 255, 0, 255])),
		{type: 'uint8_clamped'}
	)

	t.end()
})

t('parse ndsamples', t => {
	let data = [
		0, 0.5,
		-0.5, 0,
		1, -1,
		-1, 1
	]
	let shape = [4, 2]
	let dataFormat = {
		sampleRate: 48000
	}
	let samples = ndsamples({
		data: data,
		shape: shape,
		format: dataFormat
	})

	t.deepEqual(format.parse(samples),
		{sampleRate: 48000, type: 'ndsamples', channels: 2})

	t.end()
})


t('stringify plain', t => {
	t.equal(
		format.stringify({channels: 2, interleaved: false}),
		'stereo planar'
	)

	t.end()
})

t('stringify audiobuffer', t => {
	t.equal(
		format.stringify(new AudioBuffer(null, {length: 10})),
		'audiobuffer mono 44100'
	)

	t.end()
})

t('stringify skip', t => {
	t.equal(
		format.stringify({type: 'float32', endianness: 'le', interleaved: false, channels: 2}, {endianness: 'le', type: 'float32'}),
		'stereo planar'
	)
	t.end()
})

t.skip('stringify edge case', t => {


})
