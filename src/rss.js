const parseXML = (xml) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(xml, 'text/xml');
  const parseError = data.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }
  return data;
};

const parse = (xml) => {
  const data = parseXML(xml);
  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  const feed = {
    title: feedTitle,
    description: feedDescription,
  };

  const posts = [...data.querySelectorAll('item')].map((post) => {
    const link = post.querySelector('link').textContent;
    const title = post.querySelector('title').textContent;
    const description = post.querySelector('description').textContent;
    const date = post.querySelector('pubDate').textContent;
    return {
      link,
      title,
      description,
      date,
    };
  });
  return { feed, posts };
};
export default parse;
