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
	- update path to videos in configuration file: `"dir": "./data/"`

## Usage

1. run `npm run start`
2. you'll see new window with video player and panel with options

![image](https://user-images.githubusercontent.com/30548447/49381612-fbc5f680-f71c-11e8-9853-fa7096847f2c.png)

_name_ | _description_
-- | --
Sources medias | number of videas in data folder
class1 | name of class
0 | number of videos in class 
press c | name of button on the keybord that should be pressed to chose this class1 |  

3. split video into segments if you see that video-segment contains more than one class.
   - press pplay to watch whole video
   - re-run video and split it into segments with key Enter

4. press play again and start to annotate
press on corresponding button to chose class for video
For example: press c to chose class1. 

Please follow notes, in case of additional issues on class.

5. check if sesgments were annotated in folder/annotatedsegments/

expected folder sructure of annotated video is: 

(A) renaming was not configured
- folder/annotatedsegments/class1/test-0-16-segment.mp4
- folder/annotatedsegments/class2/test-17-30-segment.mp4

(B) renaming was not configured

- folder/annotatedsegments/class1/_xxx_home_xxx_user_xxx_Documents_xxx_term-annotator_xxx_folders_xxx_sourse_xxx_test-0-4
