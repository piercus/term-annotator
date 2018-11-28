# term-annotator

## Installation

1. run in terminal `git clone git@github.com:teamklap/term-annotator.git`
2. open repo in terminal with code editor
3. run `npm i` to install dependencies

## Configuration

1. **Add videos** that should be annotated
	- create new folder in in repo. for example, *data*
	- copy videos that should be annotated into folder *data*
	- videos should be renamed to match following name construction: `title-start-end.segment.mp4` or `title-start-end.segment.mp4`. For example: `test-0-30-segment.mp4`

2. **Update configuration file** for term-annotator

	- configuration settings for **term-annotator** are stored in *annotator.json* file
	- configuration params:
		- **source**
		- **classes**

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

more complex configuration example
```json
{
	"sort": true,
	"source" : {
		"dir": "my_directory",
		"recursive": true,
		"mediaType": "video",
		"videoSplit": {
			"startEndRegexp" : "\\w*-([0-9\\.]*)-([0-9\\.]*).mp4",
			"splitKey": "!",
			"minDuration": 2
		},
		"renaming": {
			"from": "/",
			"to": "_xxx_"
		}
	},
	"classes": {
		"class-a": {
			"key" : "a",
			"dir": "myAnnotation/class-a"
		},
		"class-b": {
			"key" : "b",
			"dir": "myAnnotation/class-b"
		},
		"class-c": {
			"key" : "c",
			"dir": "myAnnotation/class-c-<%=isFoo%>-<%=isBar%>",
			"params" : [{
					"label": "Is it foo ?",
					"name": "isFoo",
					"choices": [{
							"key": "Y",
							"label": "yes",
							"value": "fooTrue"
						},{
							"key": "N",
							"label": "no",
							"value": "fooFalse"
					}]
				},{
					"label": "Is it bar ?",
					"name": "isBar",
					"choices": [{
							"key": "Y",
							"label": "yes",
							"value": "barTrue"
						},{
							"key": "N",
							"label": "no",
							"value": "barFalse"
					}]
				}]
		}
	}
}
```

Then run
```
npm run start
```

Here we go !
