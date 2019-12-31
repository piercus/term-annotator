# Term-Annotator


# General

Term-Annotator is an application for media (video/images/gifs) annotation.

This application is installed on a laptop and is working locally.
It is made for images/video/gifs manual [classification](https://en.wikipedia.org/wiki/Statistical_classification) in order to train machine learning on the database.

Basically, term annotator is only moving files from one directory to another in a local computer.

## Main purpose

Term-annotator provides productivty tools for the annotator : 
* Visualization of images/gifs/videos
* Keyboard shortcuts for each category
* Ability to split videos into sub-videos
* Ability to organize categories using Questions/answers tree
* Thumbnails display for each categories
* Display of the number of items in each category in real-time


## Usage

1. Load application with this [link](https://drive.google.com/file/d/1V0M0WN6pQ4tAVk-KUmZ6-7264fp6L__x/view?usp=sharing) and unzip into `term-annotator` folder
2. Load mediafiles to annotate and unzip into new folder 
3. Run `term-annotator.exe` file from `term-annotator` folder
4. Import Configuration file:
       
      4.1. Click on button `Import Configuration File`
            <img src="https://github.com/teamklap/wiki/blob/TaniaPash-patch-6/markdown/brissot/annotations/assets/Screenshot from 2019-10-23 16-04-14.png" width="70%">
    
      4.2. in a new window `CHOOSE CONFIGURATION FILE` choose your config file.
            <img src="https://github.com/teamklap/wiki/blob/TaniaPash-patch-6/markdown/brissot/annotations/assets/Screenshot from 2019-10-23 18-38-01.png" width="70%">
    
      4.3. in a new window `CHOOSE SOURCE DIRECTORY` choose folder with files to annotate
            <img src="https://github.com/teamklap/wiki/blob/TaniaPash-patch-6/markdown/brissot/annotations/assets/Screenshot from 2019-10-23 18-38-35.png" width="70%">
5. First image is displayed to start annotation.

6. when annotation of first image is done, annotated image will be automatically saved in newly created `annotated` folder and removed from original folder where all the images are saved.

7. In annotated folder, image is being stored in folder with name-patterns like : `<team-number>-<player-number>` and `notVisible-notVisible-color` along with `notPlayer` and `other` folder.

<img src="https://github.com/teamklap/wiki/blob/TaniaPash-patch-4/markdown/brissot/annotations/urbansoccer/assets/term%20annotation/annotated.JPG" width="70%">

8. Generate Annotation results 

      8.1 click on button `Generate Result`

      8.2 save result as json file. See naming pattern [here](../architecture/rush-bucket.md#tracks-identification-annotation)


### Detailed features

#### Gifs Thumbnails

- thumbnail is created once first player of category is annotated
- thumbnail cam be updated with a click on button `NextImage`.



### Configuration

Configuration parameters for the term-annotator are strored in a json file that should be loaded once app is started. 

Configuration file should be shared with the annotator together with a data set before the annotation

**EXAMPLE**	
```
{
	"sort": true,								
	"source" : {
		"dir": "my_directory",
		"recursive": true,
		"mediaType": "video",
		"subDir":"toannotate"
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
	"destination": {
	        "destSubDir":"annotated"
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



## Import/Export Results

### Results format

```
{
  "epoch": "2019-10-25T11:13:02.723Z",
  "folders": {
    "dir-path" : {
            "thumbnail": null,
            "filenames": [
              "a"
            ]          
     },
  "termAnnotatorConfig": {...}   
     ....
}
 
```

`epoch` - an import timestamp

`dir-path` - a path to dir for a category. Each annotated category has separate directory

`filenames` - a list of files inside dir

`thumbnail` - a thumbnail stored inside dir 

`termAnnotatorConfig` - a configuration for the correction workflow


#### Example

```
{
  "epoch": "2019-10-25T11:13:02.723Z",
  "folders": {
    "../annotated/1-5" : {
            "thumbnail": null,
            "filenames": [
              "a",
              "b",
              "c",
              "w"
            ]          
     },
     ...
    "../annotated/notClean":
      {
        "filenames": [
          "q",
          "p",
          "r",
          "s"
        ],
        "thumbnail": s.png
      }  
   },
   "termAnnotatorConfig": {
	"sort": true,
	"mediaType": "gif",
	"source": {
		"subDir": "toannotate",
		"recursive": false
	},
	"destination": {
		"destSubDir": "annotated"
	},
	"classes": {
		"player01": {
			"key": "1",
			"dir": "1-1_TANx1-1_SMI"
		}
	}
}
```

### Export Result

1. click on button `Generate Result`
2. save result as json file. See naming pattern [here](../architecture/rush-bucket.md#tracks-identification-annotation)

### Import Result

1. Go to app's Menu -> Advanced -> Import Annotation File
2. Choose a Result file to be exported in new window
3. Choose a Source Directory in new window (`<name-of-dataset/toannotate>`)
4. Choose an Destination directory in new window (`<name-of-dataset/annotated>`)


## Packaging

### Local

To package repo into application run: 

	- for Windows : `npm run package-windows`
	- for Ubuntu: `npm run package-linux`

#### Packaged app is stored in:
	- for Windows : `./term-annotator-app-linux.zip`
	- for Ubuntu: `./term-annotator-app-windows.zip`

## Release into GitHub assets

Push new changes into master to release new version of app with Semantic-Release

#### Download from GitHub

Download app from Releases' assets: https://github.com/teamklap/term-annotator/releases
	- for Windows : download `term-annotator-app-windows` asset
	- for Ubuntu: download `term-annotator-app-linux` asset

## Start app
1. unzip packaged app: 
	- for Windows : `unzip` with zip manager WinRAR
	- for Ubuntu: `unzip term-annotator-app-linux.zip -d .`

2. run app:
	- for Windows: `term-annotator-win32-x64/term-annotator.exe`
	- for Ubuntu: `term-annotator-linux-x64/term-annotator`


