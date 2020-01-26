function isUrl(s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
}


const CONSTANTS = {
	'VIDEO' : 'video',
	'PERSON' : 'person',
	'ARTICLE' : 'article',
	'TOOL' : 'tool',
	'ALGORITHMS' : 'algorithms',
	'IMAGE' : 'image',
	'BOOKS' : 'books',
	'KNOWLEDGE' : 'knowledge',
	'ARTICLE' : 'article',
	'RESEARCH_PAPER' : 'research_paper',
}

const apiKey = '5b40e6a9131e15f60c6d2aac';