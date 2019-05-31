# term-annotator

## Configuration

1. **Add videos** that should be annotated
	- create new folder in repo. For example, *data*
	- copy videos that should be annotated into folder *data*
	- videos should be renamed to match following name construction: `title-start-end.segment.mp4` or `title-start-end.segment.mp4`. For example: `test-0-30-segment.mp4`

2. **Update configuration file** for term-annotator
	- configuration settings for **term-annotator** are stored in *annotator.json* file


**EXAMPLE**	
```
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
				}
				}]
		}
	}
}
```


source |   |  
-- | -- | --
sort |   | if true the images are annotated in the filename alhpabetic order
dir |   | the input directory whis videos/images to annotate
recursive |   | play all videos from folder: true/false
mediaType |   | type of files (video/images)
videSplit |   | video splitting settings section
  | startEndRegexp | foramat of file's name
  | splitKey | key that should be pressed to split video
  | minDuration | minumum duration of splitted video degment
renaming |   | video renaming settings section
  | from | rename this sign
  | to | rename into this sign
  |   |  


classes |   | classes definition |  
-- | -- | -- | --
class-name |   | class' configuration |  
  | key | the keyboard key that do this action when pressed |  
  | dir | the output directory where to move annotated images for this class |  
  | params | additional params for sub questions to the class |  
  |   | label | additional question for class
  |   | name | the name to be used in ejs template
  |   | choices | the available choices
  |   | key | key that should be pressed to chose this class
  |   | label | label of choise
  |   | value | value to use in ejs template







## Usage

1. start app 
`npm run start`

2. update path to Src Directory
`ctrl+Shift+C` or go to`Menu`-> `Configuration` -> `Add Video Directory` and specify full path to your folder with files. 
 
3. start annotation following instructions on the screen 


## Packaging

1. package repo into application run

- for Windows : `npm run package-windows
- for Ubuntu: `package-linux`

2. start app
- go to folder `./term-annotator-*/`
- run `term-annotator.exe` file
`term-annotator.exe`

