import axios from 'axios';
import urlParse from 'url-parse';
import includes from 'lodash.includes';
import remove from 'lodash.remove';
import path from 'path';
import config from '../../conf/config';

interface queryItem {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  mime: string;
  fileFormat: string;
  image: imageObject;
}

interface imageObject {
  contextLink: string;
  height: number;
  width: number;
  byteSize: number;
  thumbnailLink: string;
  thumbnailHeight: number;
  thumbnailWidth: number;
}

interface filteredImageResult {
  extension: string;
  title: string;
  url: string;
}

export const imgSearch = async (imgQueryString: string) => {
  let query = imgQueryString.replace(/[?=]/g, ' ');
  query = query.replace('img ', '');

  const googleResults = await performImageSearch(query);

  const filtered: filteredImageResult[] = await getFilteredResults(
    googleResults
  );

  const hasSearchResults: boolean =
    googleResults.searchInformation.totalResults !== 0;

  if (!hasSearchResults) {
    console.log('no results found');
    return '';
  }

  let firstValid = await getFirstValidImage(filtered);

  if (firstValid !== undefined) {
    return firstValid.url;
  }
};

const performImageSearch = async (
  query: string,
  safeSearch: string = 'high'
) => {
  try {
    const { data } = await axios.get(
      `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${config.apis.CX}&imgSize=medium&imgType=photo&num=7&safe=${safeSearch}&searchType=image&key=${config.apis.IMAGE}`
    );
    return data;
  } catch (error) {
    console.log('error in performImageSearch', error);
  }
};

const getFilteredResults = (data: any): filteredImageResult[] => {
  let bannedHosts: string = 'photobucket.com';
  let allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];
  let filtered: filteredImageResult[] = data.items.map((image: queryItem) => {
    let obj = {};
    const imgURL = image.link;
    const extension = path.extname(imgURL);
    const urlObj: any = new urlParse(imgURL);
    const { host } = urlObj;

    if (!includes(host, bannedHosts)) {
      if (isInArray(extension, allowedExtensions)) {
        obj = {
          url: image.link,
          extension,
          title: image.title,
        };
        return obj;
      }
    }
  });

  filtered = remove(filtered, undefined);
  return filtered;
};

const getFirstValidImage = async (filtered: filteredImageResult[]) => {
  let status;
  for (const each of filtered) {
    status = await checkIsValid(each.url);

    if (status) {
      return each;
    }
  }
};

const checkIsValid = async (url: string) => {
  return axios
    .get(url)
    .then((x) => {
      if (x.status !== 200) {
        return false;
      } else {
        return true;
      }
    })
    .catch((err) => {
      console.log('err here', err);
    });
};

const isInArray = (value: string, array: string[]): boolean => {
  return array.indexOf(value) > -1;
};

export default {
  imgSearch,
};
