// ==UserScript==
// @name         Sort MetaFilter Comments by Favorites
// @version      1
// @description  Sort MetaFilter comments by favorites count
// @author       Tehhund
// @match        *://*.metafilter.com/*
// @locale       en-us
// @namespace    https://greasyfork.org/users/324881
// @run-at      document-idle
// @grant       none
// Credit: uses parts from https://greasyfork.org/en/scripts/29857-metafilter-comments-sorter/
// ==/UserScript==

// Begin code reused from https://greasyfork.org/en/scripts/29857-metafilter-comments-sorter/

/*function insertFragment(elem, frag) {
	elem.parentNode.insertBefore(frag, elem.nextSibling);
}*/

function cleanCSS() {
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = `.dot-favourites body.fixed-header-visible a[name] { padding-top: 0; }
						.dot-favourites div.content { margin-bottom: 50px; }
						.dot-favourites div.comments { padding-top: 45px; }
						.dot-favourites a[name] + br { display: none; }
						.dot-favourites a[name] + br + br { display: none; }
						.sortButton {
							background-color: #88C2D8;
							color: #FFFFFF;
							display: block;
							float: left;
							font-size: 17px;
							height: 30px;
							width: 150px; }
						button[disabled] { background-color: #E6E6E6; }
						button {
							border:none;
						    background-image:none;
						    background-color:transparent;
						    -webkit-box-shadow: none;
						    -moz-box-shadow: none;
						    box-shadow: none; } `;
	document.querySelector('head').appendChild(style);
}

function createButton() {
	var parent = document.querySelector('#threadside');
	var button = document.createElement('button');
	button.innerHTML = "Sort by favourites";
	button.className = "sortButton";
	button.addEventListener('click', doSort);

	//insertFragment(parent, button);
	parent.parentNode.insertBefore(button, parent.nextSibling);
}

// End code reused from https://greasyfork.org/en/scripts/29857-metafilter-comments-sorter/

function getCommentFavorites(comment) {
  // Brute force: just treat the HTML as a string and find the phrase 'users marked this as favorite', and grab the 4 characters (for comments with over 1K Favorites) that might be number of Favorites. Works whether or not the user is logged in.
  let commentHtmlString = comment.innerHTML;
  let indexOfTargetPhrase = comment.innerHTML.search(' marked this as favorite">'); // Can't say 'users' because if there's 1 favorite it's missing the 's'.
  if (indexOfTargetPhrase === -1 ) { // The phrase doesn't appear in the HTML, so it has no favorites.
    return 0;
  } else {
    let totalFavorites = '';
    let firstChar = parseInt(commentHtmlString.substr(indexOfTargetPhrase + 26, 1));
    if (Number.isInteger(firstChar)) { totalFavorites += firstChar; } // String concatenation, not addition.

    let secondChar = parseInt(commentHtmlString.substr(indexOfTargetPhrase + 27, 1));
    if (Number.isInteger(secondChar)) { totalFavorites += secondChar; } // String concatenation, not addition.

    let thirdChar = parseInt(commentHtmlString.substr(indexOfTargetPhrase + 28, 1));
    if (Number.isInteger(thirdChar)) { totalFavorites += thirdChar; } // String concatenation, not addition.

    let fourthChar = parseInt(commentHtmlString.substr(indexOfTargetPhrase + 29, 1)); // Yes, there are a couple comments with over 1K favorites, so we have to handle that situation.
    if (Number.isInteger(fourthChar)) { totalFavorites += fourthChar; } // String concatenation, not addition.

    return parseInt(totalFavorites);
  }
}

function sortByProperty(array, allCommentsObject) { // from here: https://stackoverflow.com/a/8537663
	return array.sort(function (hashOne, hashTwo) {
    let hashOneFavorites = getCommentFavorites(allCommentsObject[hashOne]['commentDiv']);
		let hashTwoFavorites = getCommentFavorites(allCommentsObject[hashTwo]['commentDiv']);
		if (hashTwoFavorites > hashOneFavorites) return 1;
		else return -1
	})
}

/*function sortTwoCommentsByFavorites(hashOne, hashTwo) { // Given two anchor names aka hashes, determine which has more favorites and therefore should be first.
  let hashOneFavorites = getCommentFavorites(allCommentsObject[hashOne]['commentDiv']);
	console.log(hashOneFavorites);
	let hashTwoFavorites = getCommentFavorites(allCommentsObject[hashTwo]['commentDiv']);
	console.log(hashTwoFavorites);
}*/

function sortTwoCommentsByHash(hashOne,hashTwo) { // Given two anchor names aka hashes, determine which hash is lower numerically and therefore should be first.

}

function doSort() {
	console.log('doSort() ran.')
	// Gather an object of comment divs and anchors, and an array of hashes.
  let allCommentDivs = Array.from(document.getElementsByClassName('comments')).filter( function(div) { return div.previousSibling.tagName == 'A'; }); // Some "comment" divs are not actually comments. All comments, and only comments, are preceeded by an anchor tag. So this filters down to only real comment divs.
	let allCommentsObject = {}; // Create empty object to hold comment divs and anchor tags identified by anchor name aka hash.
	let hashesArray = []
	for (let currentDiv of allCommentDivs) {
		let currentAnchor = currentDiv.previousSibling;
		let currentHash = currentAnchor.name;
		allCommentsObject[currentHash] = {'commentDiv': currentDiv, 'anchor': currentAnchor};
		hashesArray.push(currentAnchor.name);
	}
	//console.log(allCommentsObject);

	// Sort array of hashes by favorites
	//hashesArray.sort(sortTwoCommentsByFavorites);
	let sortedArray = sortByProperty(hashesArray, allCommentsObject); // from here: https://stackoverflow.com/a/8537663
	console.log(sortedArray);

  // Repleace all anchors and comment Divs with sorted anchors and divs.
  for (let i=0; i < sortedArray.length; i++) {
		allCommentDivs[i].previousSibling.innerHTML = allCommentsObject[hash]['anchor']; // Replace anchor first
		allCommentDivs[i].innerHTML = allCommentsObject[hash]['commentDiv']; // Replace comment HTML.
	}

  // Finally, point the button at the unSort() function so you can return the comments to their original order.

}

function unSort() { // Just sort by Anchor name, they're in order.

}

var anchorNamesInOriginalOrder = []; // Global to store Anchor names in original order permanently.

// Run initial functions when the script first runs.
cleanCSS();
createButton();
