# term-annotator

## Installation

1. run in terminal `git clone git@github.com:teamklap/term-annotator.git`
2. open repo in terminal with code editor
3. run `npm i` to install dependencies

## Configuration

1. **Add videos** that should be annotated
	- create new folder in repo. For example, *data*
	- copy videos that should be annotated into folder *data*
	- videos should be renamed to match following name construction: `title-start-end.segment.mp4` or `title-start-end.segment.mp4`. For example: `test-0-30-segment.mp4`

2. **Update configuration file** for term-annotator
	- configuration settings for **term-annotator** are stored in *annotator.json* file
	- configuration params: 
	
	
source |   |  
-- | -- | --
sort |   | if true the images are annotated in the filename alhpabetic order
dir |   | the output directory where to move annotated images
recursive |   | play all videos from folder: true/false
mediaType |   | type of files
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

## Usage

1. run `npm run start`
2. you'll see new window with video player and panel with options

![screenshot from 2018-12-03 19-36-57](https://user-images.githubusercontent.com/30548447/49390958-fecbe180-f732-11e8-9420-40c1b251aad2.png)

_name_ | _description_
-- | --
Sources medias | number of videos in data folder
class1 | name of class
0 | number of videos in class 
press c | name of button on the keybord that should be pressed to chose this class1 |  

3. **split video** into segments if you see that video contains more than one class.
   - press play to watch whole video
   - re-run video and press Enter at the moment that you want to cut video
   ![image](https://user-images.githubusercontent.com/30548447/49391086-54a08980-f733-11e8-981a-99871c05eb54.png)
   - wait for run of created video segment (this splited video segment will ran automaticaly in 5-10 seconds after splitting)

4. **start annotation**
   - press on corresponding button to choose class for video
_For example: press c to choose class1._ 

5. continue step 3 and 4 till whole video is annotated

_Please follow notes, in case of additional issues on class._
![screenshot from 2018-12-03 19-52-32](https://user-images.githubusercontent.com/30548447/49391740-30de4300-f735-11e8-837c-fde97e3c3d09.png)

5. **check if videos were annotated** in folder/annotatedSegments/

expected folder sructure of annotated video is: 

(A) renaming was not configured
- folder/annotatedsegments/class1/test-0-16-segment.mp4
- folder/annotatedsegments/class2/test-17-30-segment.mp4

(B) renaming was configured

- folder/annotatedsegments/class1/_xxx_home_xxx_user_xxx_Documents_xxx_term-annotator_xxx_folders_xxx_sourse_xxx_test-0-4
