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


# Usage



## Start Term-Annotator

*app is shared with a zip file*

1. Unzip loaded Term-Annotator app
2. Start App with a double-click on`term-annotator.exe` (stored in unzipped app folder)

## Start Annotation

### Default Start

- click on button `Start Annotation`
- choose a `Source Directory` (see [Data Structure](#Data-Structure))
- choose an app's configuration: 
       - **Load a new Config file** - (see Configuration Structure)  - to start app with a prepared config file
       - **Start with a Default Config** - (see Configuration Structure) - to start app with a default configuration

### Restart app

- click on button `Start Annotation`
- choose a `Source Directory` (see [Data Structure](#Data-Structure))
- choose: 
    - **Load a Previous Config** - to start from a configuration that was used before app's restart (saved inside main directory <.term-annotator.json>*)
    - **Load a new Config file** - to start app with a new config file
    - **Start with a Default Config** - (see Configuration Structure)  - to start app with a default configuration


### Generate Annotation results 

   - click on button `Generate Result`
   - save result as json file

### Import Annotation

   - click on button `Import Annotation`
   - in a new window `CHOOSE ANNOTATION FILE`: choose file to import
   - in a new window `CHOOSE SOURCE DIRECTORY` choose **Directory Folder**


## Data structure

Data structure is set with a app's configuration:
- `source.subdir` - a source subdirectory with files to annotate
- `destination.destSubDir` - a source subdirectory with annotated files


### Examples

#### Subdirectories
`<data-set-name>/<source.subdir>`  - directory with files to annotate
	Example: `dataset-1/toannotate/file.png`
`<data-set-name>/<destination.destSubDir>` - directory with annotated files.
	Example: `dataset-1/annotated/category1/file.png`

#### No subdirectorues
`<data-set-name>`  - directory with files to annotate
	Example: `dataset-1/file.png`
`<destination-folder-name>` - directory with annotated files.
	Example: `dataset-1-annotated/category1/file.png`

## Configuration-Structure

Configuration parameters for the term-annotator 

- `sort` - `false`, `true` - sort files in a sorce directory
- `source` - source directory configuration
- `destination` - destination directory configuration
- `classes` - annotation options parameters


#### Source

`source.subDir` -  a subdirectory with files to annotate: `<data-set-name>/<source.subdir>`

#### Destination 

`destination.destSubDir` - a subdirectory to move annotated files: `<data-set-name>/<destination.destSubDir>`

#### Classes

`classes.<class-name>` - name of the class

**Option**:
- "key": `<key>` - a key on keybord responsible for the category
- "dir": `<name-of-dir>` - a name of directoy for the class 
- "description": `<description>` - a short description that is visible on a main app's window
- "params"  - a list of suboption for each category

**Example**


```
	"classes": {
		"category1": {
			"key": "1",
			"dir": "category1",
			"description": "red"
		}
```
```
	"classes": {
		"category1": {
			"key": "1",
			"dir": "<%=number%>",
			"params": [
				{
					"label": "number",
					"name": "number",
					"choices": [
						{
							"key": "1",
							"label": "subcategory1",
							"value": "1"
						},
						{
							"key": "2",
							"label": "subcategory2",
							"value": "2"
						} ]
				}]
				}
			}

```

See more example [here](https://github.com/teamklap/term-annotator/tree/master/config-examples)

### Detailed features

#### Gifs Thumbnails

- thumbnail is created once first player of category is annotated
- thumbnail cam be updated with a click on button `NextImage`.

#### Modify Configuration

**button `Add New Class`**

- fill a new class parameters in a new window
- updated configuration is saved in `<.term-annotator.json>`


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


