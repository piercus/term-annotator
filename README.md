# term-annotator

## Usage

Update configuration file `config.json` like
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
npm start
```

Here we go !


### Configuration

#### Update path to Src Directory
run `ctrl+Shift+C` or go to`Menu`-> `Configuration` -> `Add Video Directory` and specify path to your folder with files. 
