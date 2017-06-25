/**
 * @module audio-format
 */
'use strict'

var rates = require('sample-rate')

module.exports = {
	parse: parse,
	stringify: stringify,
	guess: guess
}

var dtypes = {
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
	assert(typeof str === 'string', 'Format should be a string')

	var format = {}
	var parts = str.split(/\s+/)

	for (var i = 0; i < parts.length; i++) {
		var part = parts[i].toLowerCase()

		if (part === 'planar') {
			format.interleaved = false
			if (format.channels == null) format.channels = 2
		}
		else if (part === 'interleaved') {
			format.interleaved = true
			if (format.channels == null) format.channels = 2
		}
		else if (channelNumber[part]) format.channels = channelNumber[part]
		else if (part === 'le') format.endianness = 'le'
		else if (part === 'be') format.endianness = 'be'
		else if (dtypes[part]) format.dtype = part
		else if (rates[part]) format.sampleRate = rates[part]
		else if (/^\d+$/.test(part)) format.sampleRate = parseInt(part)
		else throw Error('Cannot identify part `' + part + '`')
	}

	return format
}

function stringify (format, omit) {
	assert(isObj(format), 'Format should be an object')

	if (omit === undefined) omit = {
		endianness: 'le'
	} else if (omit == null) {
		omit = {}
	} else if (typeof omit === 'string') {
		omit = parse(omit)
	}

	if (!format.channels) format.channels = format.numberOfChannels || format.channelCount

	var parts = []

	if (format.dtype !== omit.dtype) parts.push(format.dtype || 'float32')
	if (format.channels !== omit.channels) parts.push(channelName[format.channels])
	if (format.endianness !== omit.endianness) parts.push(format.endianness || 'le')
	if (format.interleaved !== omit.interleaved) parts.push(format.interleaved ? 'interleaved' : 'planar')
	if (format.sampleRate !== omit.sampleRate) parts.push(format.sampleRate)

	return parts.join(' ')
}

