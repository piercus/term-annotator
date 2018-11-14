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
npm run start
```

Here we go !
