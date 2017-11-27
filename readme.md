# audio-format [![Build Status](https://travis-ci.org/audiojs/audio-format.svg?branch=master)](https://travis-ci.org/audiojs/audio-format) [![unstable](https://img.shields.io/badge/stability-unstable-green.svg)](http://github.com/badges/stability-badges) [![Greenkeeper badge](https://badges.greenkeeper.io/audiojs/audio-format.svg)](https://greenkeeper.io/)

Audio data format parser/detector/serializer.

[![npm install audio-format](https://nodei.co/npm/audio-format.png?mini=true)](https://npmjs.org/package/audio-format/)

### obj = format.parse(string)

Parse format properties from a string. Returns only guaranteed properties and does not try to guess them.

```js
format.parse('interleaved uint8 le stereo 44100')
// {interleaved: true, type: 'uint8', endianness: 'le', channels: 2, sampleRate: 44100}

format.parse('stereo audiobuffer 96000')
// {channels: 2, type: 'audiobuffer', sampleRate: 96000, interleaved: false, endianness: 'le'}
```

### str = format.stringify(obj, defaults?)

Get string identifying a format object. Optional `defaults` can indicate properties to skip if format value matches them.

```js
format.stringify({channels: 2, interleaved: false})
// 'stereo planar'

format.stringify(
	{type: 'float32', endianness: 'le', interleaved: false, channels: 2},
	{endianness: 'le', type: 'float32'}
)
// 'stereo planar'

format.stringify(new AudioBuffer(null, {length: 10}))
// 'mono audiobuffer 44100'
```

### obj = format.detect(obj)

Retrieve available format properties from an audio-like object.

```js
format.detect(new AudioBuffer(null, {length: 10, numberOfChannels: 2}))
// {channels: 2, type: 'audiobuffer', sampleRate: 44100, endianness: 'le', interleaved: false}

format.detect(new Uint8ClampedArray([0, 255, 0, 255]))
// {type: 'uint8_clamped'}

format.detect(ndarray([0,0,0,0], [2,2]))
// {type: 'ndarray', interleaved: false, channels: 2}
```

### str = format.type(obj)

Get type string identifying data container.

```js
format.type(new AudioBuffer(ctx, {length: 1024})) // 'audiobuffer'
format.type(new Float32Array([-1, 1])) // 'float32'
format.type(new Float32Array([-1, 1]).buffer) // 'arraybuffer'
format.type(Array(100)) // 'array'
format.type(Buffer.from([0, 1, ...])) // 'buffer'
format.type(ndarray([0,0,0,0], [2,2])) // 'ndarray'
```


#### `format.interleaved` marker

| Value | Meaning |
|---|---|
| `'interleaved'`, `'interleave'` | `interleaved` is `true`, `channels` is `2` or more. |
| `'planar'` | `interleaved` is `false`, `channels` is `2` or more. |

#### `format.endianness` marker

| Value | Meaning |
|---|---|
| `'le'` | `endianness` is `'le'` (little endian), `type` is not `'int8'` or `'uint8'` |
| `'be'` | `endianness` is `'be'` (big endian), `type` is not `'int8'` or `'uint8'` |

#### `format.channels` marker

| Value | Meaning |
|---|---|
| `'mono'` | 1 channel |
| `'stereo'` | 2 channels |
| `'2.1'` | 3 channels |
| `'quad'` | 4 channels |
| `'5.1'` | 5 channels |
| `'*-channel'` | N channels |

#### `format.sampleRate` marker

| Value | Meaning |
|---|---|
| `Number` | Any number, primarily [default sample-rates](https://github.com/audiojs/sample-rate) |

#### `format.type` marker

| Value | Meaning |
|---|---|
| `'uint8'` | _Uint8Array_ |
| `'uint8_clamped'` | _Uint8ClampedArray_ |
| `'uint16'` | _Uint16Array_ |
| `'uint32'` | _Uint32Array_ |
| `'int8'` | _Int8Array_ |
| `'int16'` | _Int16Array_ |
| `'int32'` | _Int32Array_ |
| `'float32'`, `'float'` | _Float32Array_ |
| `'float64'` | _Float64Array_ |
| `'array'` | _Array_ |
| `'arraybuffer'` | _ArrayBuffer_ |
| `'buffer'` | _Buffer_ |
| `'audiobuffer'` | _AudioBuffer_ |
| `'ndarray'` | [_ndarray_](https://github.com/scijs/ndarray) |
| `'ndsamples'` | [_ndsamples_](https://github.com/livejs/ndsamples) |


## See also

* [pcm-convert](https://github.com/audiojs/pcm-convert) converts low-level pcm data from one format to another


## License

(c) 2017 Dmitry Yvanov @ audiojs. MIT License
