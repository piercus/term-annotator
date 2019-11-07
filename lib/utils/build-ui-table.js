const path = require('path');

/**
 *
 * @typedef {String} ThumbnailPath  - path to a thumbnail
 * @example '../annotated/not-clean/thumbnail/g.png'
 */
/**
 *
 * @param {ThumbnailPath} thumbnailPath
 * @returns {String} path to thumbnail main dir
 * @example '../annotated/not-clean'
 */
const getThumbnailDirPath = function (thumbnailPath) {
	return thumbnailPath.replace(/\/thumbnails\/[-_.0-9a-z]*$/, '');
};

/**
 * @typedef {String} CategoryName - a name of category
 * @example 'notClean'
 */

/**
 * @typedef {Array.<String>} filenames - list of filenames
 * @example [a.gif, b.gif ...]
 */
/**
 * @typedef {String} key - a key on a keyborad that should be pressed for corresponded category
 * @example "m"
 */

/**
  * @typedef {Number} numFiles - a number of files in a directory
  */

/**
 * @typedef {String} thumbnail - a name of thumbnail
 * @example "a.png"
 */

/**
 * @typedef {Object.<filenames, key, numFiles, thumbnail} CategoryData - info about each category
 */

/**
 * @typedef {String} label - a label of category
 * @example "number"
 */

/**
 * @typedef {String} label - a name of category
 * @example "number"
 */

/**
 * @typedef {Object.<key, numFiles,label,value, thumbnail} Choice
 * @example
 * ```
 * key: "1"
 * label: "player1"
 * numFiles: 3
 * thumbnail: "../annotated/1-1/thumbnails/111111_23_24-2-1570481465391-person-18512-150.png"
 * value: "1"
 * ```
 */

/**
 * @typedef {Array.<Choice>} choices - subcategories info
  */

/**
 * @typedef {Object.<choices, label,name>} [main] - info about first level choice (specified if there are 2 question for one category)
 */

/**
 * @typedef {Array.<choices, label,name>} sub - info about second level questions
 */

/**
 * @typedef {Object.<main,sub>} SubCategoryData - info about each category
 */

/**
 * @typedef {Object.<CategoryName, CategoryData} MainCatsInfo - a data for each category
 */

/**
 * @typedef {Object.<CategoryName, SubCategoryData} SubCatsInfo - a data for each category with a choices
 */

/**
 * @param {Object} opts
 * @param {Number} numSrcFiles - number of files in a src directory
 * @param {MainCatsInfo} mainCatsInfo
 * @param {SubCatsInfo}  subCatsInfo
 * @returns {Object.<MainCategoriesTable,SubCategoriesTable>}
 */

module.exports = function ({numSrcFiles, mainCatsInfo, subCatsInfo}) {
	let firstRow = '<td>Source medias</td>';
	let secondRow = `<td>${numSrcFiles}</td>`;
	let thirdRow = '<td></td>';
	let fourthRow = '<td></td>';
	let fifthRow = '<td></td>';
	let sixthRow = '<td></td>';
	let seventhRow = '<td></td>';
	let eighthRow = '<td></td>';

	// Build mainCategoriesTable
	const classNames = Object.keys(mainCatsInfo);
	classNames.forEach((cN, index) => {
		firstRow += `<td>${cN}</td>`;
		secondRow += `<td>${mainCatsInfo[cN].numFiles}</td>`;
		thirdRow += `<td>press ${mainCatsInfo[cN].key}</td>`;

		if (mainCatsInfo[cN].thumbnail) {
			const thumbnail = path.join(process.cwd(), mainCatsInfo[cN].thumbnail);

			const thumbnailDirPath = getThumbnailDirPath(mainCatsInfo[cN].thumbnail);

			fourthRow += `<td > \
            <img id=im-${index} src='${thumbnail}' style="width:250px;height:300px !important;"> \
            <a href="#"  id=${thumbnailDirPath} onclick="nextThumbnail(id)" class="next">Next Image &raquo;</a> \
            </td>`;
		} else {
			fourthRow += '<td><img src=\'./dist/No_Image_Available.png\' style="width:70px;height:70px !important;"></td>';
		}
	});

	// Build subCategoriesTable
	const paramsNames = Object.keys(subCatsInfo);
	paramsNames.forEach(pN => {
		if (subCatsInfo[pN].sub[0]) {
			if (subCatsInfo[pN].main) {
				const sharedChoisesNum = subCatsInfo[pN].sub[0].choices.length / subCatsInfo[pN].main.choices.length;
				subCatsInfo[pN].main.choices.forEach(ch => {
					fifthRow += `<td colspan="${sharedChoisesNum}">&nbsp;${subCatsInfo[pN].main.name}-${ch.label}</td>`;
				});
			}

			subCatsInfo[pN].sub[0].choices.forEach((choice, index) => {
				sixthRow += `<td>${choice.label}</td>`;
				seventhRow += `<td>${choice.numFiles}</td>`;
				if (choice.thumbnail) {
					const thumbnail = path.join(process.cwd(), choice.thumbnail);
					const thumbnailDirPath = getThumbnailDirPath(choice.thumbnail);
					eighthRow += `<td ><img id=im-${index} src='${thumbnail}' style="width:250px;height:300px !important;"> \
            <a href="#"  id=${thumbnailDirPath} onclick="nextThumbnail(id)" class="next">Next Image &raquo;</a> \
            </td>`;
				} else {
					eighthRow += '<td><img src=\'./dist/No_Image_Available.png\' style="width:70px;height:70px !important;"></td>';
				}
			});
		}
	});

	const mainCategoriesTable = `<table id='categories'><tr>${firstRow}</tr><tr>${secondRow}</tr><tr>${thirdRow}</tr><tr>${fourthRow}</tr></table>`;
	const subCategoriesTable = `<table id='categories'><tr>${fifthRow}</tr><tr>${sixthRow}</tr><tr>${seventhRow}</tr><tr>${eighthRow}</tr></table>`;

	return {mainCategoriesTable, subCategoriesTable};
};
