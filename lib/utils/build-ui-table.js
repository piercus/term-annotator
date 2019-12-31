/**
 *
 * @typedef {String} ThumbnailPath  - path to a thumbnail
 * @example '../annotated/not-clean/thumbnail/g.png'
 */

/**
 *
 * @param {ThumbnailPath} thumbnailPath
 * @returns {String} a path to thumbnail main dir
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
 * @typedef {String} Filename - a name of a file
 * @example [a.gif, b.png ...]
 */

/**
 * @typedef {Object} Choice
 * @property {String} Key - a key on a keyborad that should be pressed for corresponded category
 * @property {Number} numFiles - a number of files in a directory
 * @property {Filename} thumbnail - a name of thumbnail
 * @property {String} value - a value of a choice
 * @example
 * ```
 * {
 * 	key: "1"
 * 	label: "player1"
 * 	numFiles: 3
 * 	thumbnail: "../annotated/1-1/thumbnails/111111_23_24-2-1570481465391-person-18512-150.png"
 * 	value: "1"
 * }
 * ```
 */

/**
 * @typedef {Object.<choices, label,name>} [main] - info about first level choice (specified if there are 2 question for one category)
 */

/**
 * @typedef {Object} CategoryInfo
 * @property {Array.<Choice>} choices
 * @property {String} label - a name of category
 * @property {String} name - a name of category
 */

/**
 * @typedef MainCategoryData
 * @property {Array.<Filename>} filenames
 * @property {Filename} thumbnail
 * @property {String} key - a key on a keyborad that should be pressed for corresponded category
 * @property {Number} numFiles - a number of files in a categorie's dir
 * @example
 * ```
 * {
 *   filenames:["a.gif",..]
 *   key: "m"
 *   numFiles: 50
 *   thumbnail: "a.png"
 * }
 * ```
 */

/**
 * @typedef {Object.<CategoryName, MainCategoryData>} MainCatsInfo - a data for each main category
 */

/**
 * @typedef {Object} SubCategoryData - an info about each category
 * @property {CategoryInfo} [main] - an info about first level choice (specified if there are 2 question for one category)
 * @property {Array.<CategoryInfo>} sub - an info about second level categories
 */

/**
 * @typedef {Object.<CategoryName, SubCategoryData>} SubCatsInfo - a data for each category with a choices
 */

/**
 * @typedef {String} Table - a html table
 * @example
 * ```
 * <table id='categories'><tr>notClean</tr><tr>...
 * ```
 */

/**
 * @typedef {Object} Result
 * @property {Table} mainCategoriesTable
 * @property {Table} subCategoriesTable
 */

/**
 * @param {Object} opts
 * @param {Number} numSrcFiles - number of files in a src directory
 * @param {MainCatsInfo} mainCatsInfo
 * @param {SubCatsInfo}  subCatsInfo
 * @returns {Result} - mainCat and subCat tables are generated
 */

module.exports = function ({numSrcFiles, mainCatsInfo, subCatsInfo}) {
	let classNamesRow = '<td>Source medias</td>';
	let descriptionRow = '<td></td>';
	let filesNumberRow = `<td>${numSrcFiles}</td>`;
	let keysRow = '<td></td>';
	let thumbnailsRow = '<td></td>';
	let subClassNamesRow = '<td></td>';
	let choiceNamesRow = '<td></td>';
	let choiceDescriptionRow = '<td></td>';
	let choiceFilesNumberRow = '<td></td>';
	let choiceThumbnailsRow = '<td></td>';

	// Build mainCategoriesTable
	const classNames = Object.keys(mainCatsInfo);
	classNames.forEach((cN, index) => {
		classNamesRow += `<td>${cN}</td>`;
		const descriptionCln = (mainCatsInfo[cN].description) ? `<td><ul><li>${mainCatsInfo[cN].description.replace(/,/g,"</li>\n<li>")}</li></ul></td>` : '<td></td>';
		descriptionRow += descriptionCln;
		filesNumberRow += `<td>${mainCatsInfo[cN].numFiles}</td>`;
		keysRow += `<td>press ${mainCatsInfo[cN].key}</td>`;

		if (mainCatsInfo[cN].thumbnail) {
			const {thumbnail} = mainCatsInfo[cN];
			const thumbnailDirPath = getThumbnailDirPath(mainCatsInfo[cN].thumbnail);

			thumbnailsRow += `<td > \
			<img id=im-${index} src='${thumbnail}' style="width:250px;height:300px !important;"> \
			<a href="#"  id="${thumbnailDirPath}" onclick="nextThumbnail(id)" class="next">Next Image &raquo;</a> \
			</td>`;
		} else {
			thumbnailsRow += '<td><img src=\'./dist/No_Image_Available.png\' style="width:70px;height:70px !important;"></td>';
		}
	});

	// Build subCategoriesTable
	const paramsNames = Object.keys(subCatsInfo);
	paramsNames.forEach(pN => {
		if (subCatsInfo[pN].sub[0]) {
			if (subCatsInfo[pN].main) {
				const sharedChoisesNum = subCatsInfo[pN].sub[0].choices.length / subCatsInfo[pN].main.choices.length;
				subCatsInfo[pN].main.choices.forEach(ch => {
					subClassNamesRow += `<td colspan="${sharedChoisesNum}">&nbsp;${subCatsInfo[pN].main.name}-${ch.label}</td>`;
				});
			}

			subCatsInfo[pN].sub[0].choices.forEach((choice, index) => {
				choiceNamesRow += `<td>${choice.label}</td>`;
				const choiceDescriptionCln = (choice.description) ? `<td>${choice.description}</td>` : '<td></td>';
				choiceDescriptionRow += choiceDescriptionCln;
				choiceFilesNumberRow += `<td>${choice.numFiles}</td>`;
				if (choice.thumbnail) {
					const {thumbnail} = choice;
					const thumbnailDirPath = getThumbnailDirPath(choice.thumbnail);
					choiceThumbnailsRow += `<td ><img id=im-${index} src='${thumbnail}' style="width:250px;height:300px !important;"> \
			<a href="#"  id=${thumbnailDirPath} onclick="nextThumbnail(id)" class="next">Next Image &raquo;</a> \
			</td>`;
				} else {
					choiceThumbnailsRow += '<td><img src=\'./dist/No_Image_Available.png\' style="width:70px;height:70px !important;"></td>';
				}
			});
		}
	});

	const mainCategoriesTable = `<table id='categories'><tr>${classNamesRow}</tr><tr>${descriptionRow}</tr><tr>${filesNumberRow}</tr><tr>${keysRow}</tr><tr>${thumbnailsRow}</tr></table>`;
	const subCategoriesTable = `<table id='categories'><tr>${subClassNamesRow}</tr><tr>${choiceNamesRow}</tr><tr>${choiceDescriptionRow}</tr><tr>${choiceFilesNumberRow}</tr><tr>${choiceThumbnailsRow}</tr></table>`;
	const addNewClassBtn = '<a href="#"  id=addNewClassBtn onclick="openAddNewClassWindow()" class="next">Add New Class</a>';
	return {mainCategoriesTable, subCategoriesTable, addNewClassBtn};
};
