/**
 * @module audio-format
 */
'use strict'

var rates = require('sample-rate')
var os = require('os')
var isAudioBuffer = require('is-audio-buffer')
var isBuffer = require('is-buffer')
var isPlainObj = require('is-plain-obj')
var pick = require('pick-by-alias')

module.exports = {
	parse: parse,
	stringify: stringify,
	detect: detect,
	type: getType
}

var endianness = os.endianness instanceof Function ? os.endianness().toLowerCase() : 'le'

var types = {
	'uint': 'uint32',
	'uint8': 'uint8',
	'uint8_clamped': 'uint8',
	'uint16': 'uint16',
	'uint32': 'uint32',
	'int': 'int32',
	'int8': 'int8',
	'int16': 'int16',
	'int32': 'int32',
	'float': 'float32',
	'float32': 'float32',
	'float64': 'float64',
	'array': 'array',
	'arraybuffer': 'arraybuffer',
	'buffer': 'buffer',
	'audiobuffer': 'audiobuffer',
	'ndarray': 'ndarray',
	'ndsamples': 'ndsamples'
}
var channelNumber = {
	'mono': 1,
	'stereo': 2,
	'quad': 4,
	'5.1': 6,
	'2.1': 3,
	'3-channel': 3,
	'5-channel': 5
}
var maxChannels = 32
for (var i = 6; i < maxChannels; i++) {
	channelNumber[i + '-channel'] = i
}

var channelName = {}
for (var name in channelNumber) {
	channelName[channelNumber[name]] = name
}
//parse format string
function parse (str) {
	var format = {}

	var parts = str.split(/\s*[,;_]\s*|\s+/)

	for (var i = 0; i < parts.length; i++) {
		var part = parts[i].toLowerCase()

		if (part === 'planar' && format.interleaved == null) {
			format.interleaved = false
			if (format.channels == null) format.channels = 2
		}
		else if ((part === 'interleave' || part === 'interleaved') && format.interleaved == null) {
			format.interleaved = true
			if (format.channels == null) format.channels = 2
		}
		else if (channelNumber[part]) format.channels = channelNumber[part]
		else if (part === 'le') format.endianness = 'le'
		else if (part === 'be') format.endianness = 'be'
		else if (types[part]) {
			format.type = types[part]
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


//parse available format properties from an object
function detect (obj) {
	if (!obj) return {}

	var format = pick(obj, {
		channels: 'channel channels numberOfChannels channelCount',
		sampleRate: 'sampleRate rate',
		interleaved: 'interleave interleaved',
		type: 'type',
		endianness: 'endianness'
	})

	// ndsamples case
	if (format.sampleRate == null && obj.format && obj.format.sampleRate) {
		format.sampleRate = obj.format.sampleRate
	}
	if (obj.planar) format.interleaved = false
	if (format.interleaved != null) {
		if (format.channels == null) format.channels = 2
	}
	if (format.type == null) {
		var type = getType(obj)
		if (type) format.type = type
	}

	if (format.type === 'audiobuffer') {
		format.endianness = endianness
		format.interleaved = false
	}

	return format
}


//convert format string to format object
function stringify (format, omit) {
	if (omit === undefined) {
		omit = {endianness: 'le'}
	} else if (omit == null) {
		omit = {}
	} else if (typeof omit === 'string') {
		omit = parse(omit)
	} else {
		omit = detect(omit)
	}

	if (!isPlainObj(format)) format = detect(format)

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


//return type string for an object
function getType (arg) {
	if (isAudioBuffer(arg)) return 'audiobuffer'
	if (isBuffer(arg)) return 'buffer'
	if (Array.isArray(arg)) return 'array'
	if (arg instanceof ArrayBuffer) return 'arraybuffer'
	if (arg.shape && arg.dtype) return arg.format ? 'ndsamples' : 'ndarray'
	if (arg instanceof Float32Array) return 'float32'
	if (arg instanceof Float64Array) return 'float64'
	if (arg instanceof Uint8Array) return 'uint8'
	if (arg instanceof Uint8ClampedArray) return 'uint8_clamped'
	if (arg instanceof Int8Array) return 'int8'
	if (arg instanceof Int16Array) return 'int16'
	if (arg instanceof Uint16Array) return 'uint16'
	if (arg instanceof Int32Array) return 'int32'
	if (arg instanceof Uint32Array) return 'uint32'
}
