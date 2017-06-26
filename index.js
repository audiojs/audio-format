/**
 * @module audio-format
 */
'use strict'

var rates = require('sample-rate')
var os = require('os')
var isAudioBuffer = require('is-audio-buffer')
var isBuffer = require('is-buffer')
var isPlainObj = require('is-plain-obj')

module.exports = {
	parse: parse,
	stringify: stringify
}

var endianness = os.endianness instanceof Function ? os.endianness().toLowerCase() : 'le'

var types = {
	'uint8': 'uint8',
	'uint8_clamped': 'uint8',
	'uint16': 'uint16',
	'uint32': 'uint32',
	'int8': 'int8',
	'int16': 'int16',
	'int32': 'int32',
	'float32': 'float32',
	'float64': 'float64',
	'array': 'float32',
	'arraybuffer': 'uint8',
	'buffer': 'uint8',
	'audiobuffer': 'float32',
	'ndarray': 'float32',
	'ndsamples': 'float32'
}
var channelNumber = {
	'mono': 1,
	'stereo': 2,
	'quad': 4,
	'5.1': 6,
	'3-channel': 3,
	'5-channel': 5
}
for (var i = 6; i < 32; i++) {
	channelNumber[i + '-channel'] = i
}

var channelName = {}
for (var name in channelNumber) {
	channelName[channelNumber[name]] = name
}

function parse (str) {
	if (!str) return {}

	var format = {}

	//non-string args
	if (typeof str != 'string') {
		var channels = str.channels || str.numberOfChannels || str.channelCount
		var sampleRate = str.sampleRate || str.rate || (str.format && str.format.sampleRate)
		var interleaved = str.interleaved
		var type = getType(str)

		if (channels) format.channels = channels
		if (sampleRate) format.sampleRate = sampleRate
		if (interleaved != null) {
			format.interleaved = interleaved
			if (format.channels == null) format.channels = 2
		}
		if (type) format.type = type
		if (str.endianness) format.endianness = str.endianness

		if (format.type === 'audiobuffer') {
			format.endianness = endianness
			format.interleaved = false
		}

		return format
	}

	var parts = str.split(/\s+/)

	for (var i = 0; i < parts.length; i++) {
		var part = parts[i].toLowerCase()

		if (part === 'planar' && format.interleaved == null) {
			format.interleaved = false
			if (format.channels == null) format.channels = 2
		}
		else if (part === 'interleaved' && format.interleaved == null) {
			format.interleaved = true
			if (format.channels == null) format.channels = 2
		}
		else if (channelNumber[part]) format.channels = channelNumber[part]
		else if (part === 'le') format.endianness = 'le'
		else if (part === 'be') format.endianness = 'be'
		else if (types[part]) {
			format.type = part
			if (part === 'audiobuffer') {
				format.endianness = endianness
				format.interleaved = false
			}
		}
		else if (rates[part]) format.sampleRate = rates[part]
		else if (/^\d+$/.test(part)) format.sampleRate = parseInt(part)
		else throw Error('Cannot identify part `' + part + '`')
	}

	return format
}

function stringify (format, omit) {
	if (omit === undefined) {
		omit = {endianness: 'le'}
	} else if (omit == null) {
		omit = {}
	} else if (typeof omit === 'string') {
		omit = parse(omit)
	}

	if (!isPlainObj(format)) format = parse(format)

	var parts = []

	if (format.type != null && format.type !== omit.type) parts.push(format.type || 'float32')
	if (format.channels != null && format.channels !== omit.channels) parts.push(channelName[format.channels])
	if (format.endianness != null && format.endianness !== omit.endianness) parts.push(format.endianness || 'le')
	if (format.interleaved != null && format.interleaved !== omit.interleaved) {
		if (format.type !== 'audiobuffer') parts.push(format.interleaved ? 'interleaved' : 'planar')
	}
	if (format.sampleRate != null && format.sampleRate !== omit.sampleRate) parts.push(format.sampleRate)

	return parts.join(' ')
}


function getType (str) {
	if (isAudioBuffer(str)) return 'audiobuffer'
	if (isBuffer(str)) return 'buffer'
	if (Array.isArray(str)) return 'array'
	if (str instanceof ArrayBuffer) return 'arraybuffer'
	if (str.shape && str.dtype) return str.format ? 'ndsamples' : 'ndarray'
	if (str instanceof Float32Array) return 'float32'
	if (str instanceof Float64Array) return 'float64'
	if (str instanceof Uint8Array) return 'uint8'
	if (str instanceof Uint8ClampedArray) return 'uint8_clamped'
	if (str instanceof Int8Array) return 'int8'
	if (str instanceof Int16Array) return 'int16'
	if (str instanceof Uint16Array) return 'uint16'
	if (str instanceof Int32Array) return 'int32'
	if (str instanceof Uint32Array) return 'uint32'
}
