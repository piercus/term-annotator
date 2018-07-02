# term-annotator

## Usage

Create a configuration file like

*.term-annotator.json**
```json
{
	"source" : {
		"dir": "./folders/source",
		"recursive": false
	},
	"classes": {
		"classA": {
			"key" : "a",
			"dir": "./folders/classADir"
		},
		"classB": {
			"key" : "b",
			"dir": "./folders/classBDir"
		}
	}
}
```

Then run
```
term-annotator -c term-annotator.json
```

Here we go !

<image>
