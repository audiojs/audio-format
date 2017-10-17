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

t('parse commas and colons', t => {
	t.deepEqual(
		format.parse('stereo,audiobuffer , 96000'),
		{channels: 2, type: 'audiobuffer', sampleRate: 96000, interleaved: false, endianness: 'le'}
	)
	t.deepEqual(
		format.parse('stereo;audiobuffer_96000'),
		{channels: 2, type: 'audiobuffer', sampleRate: 96000, interleaved: false, endianness: 'le'}
	)
	t.end()
})

t('detect audio buffer', t => {
	t.deepEqual(
		format.detect(new AudioBuffer(null, {length: 10, numberOfChannels: 2})),
		{channels: 2, type: 'audiobuffer', sampleRate: 44100, endianness: 'le', interleaved: false}
	)

	t.end()
})

t('detect typed array', t => {
	t.deepEqual(
		format.detect(new Uint8ClampedArray([0, 255, 0, 255])),
		{type: 'uint8_clamped'}
	)


	t.end()
})

t('detect ndsamples', t => {
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

	t.deepEqual(format.detect(samples),
		{sampleRate: 48000, type: 'ndsamples', channels: 2})

	t.end()
})

t('parse interleaved channels', t => {
	t.deepEqual(
		format.parse('interleaved'),
		{channels: 2, interleaved: true}
	)

	t.end()
})

t('parse planar channels', t => {
	t.deepEqual(
		format.parse('planar'),
		{channels: 2, interleaved: false}
	)

	t.end()
})

t('parse custom channels', t => {
	t.deepEqual(format.parse('3-channel'), {channels: 3})
	t.end()
})

t('detect interleaved obj', t => {
	t.deepEqual(format.detect({interleaved: true}), {channels: 2, interleaved: true})

	t.end()
})

t('detect obj', t => {
	t.deepEqual(format.detect({type: 'int16'}), {type: 'int16'})
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

t('stringify defaults', t => {
	t.equal(
		format.stringify({type: 'float32', endianness: 'le', interleaved: false, channels: 2}, {endianness: 'le', type: 'float32'}),
		'stereo planar'
	)
	t.end()
})

t('format.type', t => {
	var nd = ndarray(new Float32Array([0,0,0,0]), [2,2])

	t.equal(
		format.type(new AudioBuffer(null, {length: 1024})),
		'audiobuffer'
	)
	t.equal(
		format.type(new Float32Array([-1, 1])),
		'float32'
	)
	t.equal(
		format.type(new Float32Array([-1, 1]).buffer),
		'arraybuffer'
	)
	t.equal(
		format.type(Array(100)),
		'array'
	)
	t.equal(
		format.type(Buffer.from([0, 1])),
		'buffer'
	)
	t.equal(
		format.type(nd),
		'ndarray'
	)

	t.end()
})

