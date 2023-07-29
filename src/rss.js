export default (xml, url) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(xml, 'text/xml');
  const parseError = data.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError.textContent);
  }
  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  const feed = {
    link: url,
    title: feedTitle,
    description: feedDescription,
  };
  // преобразум псевдо - коллекцию в массив при помощи rest
  // используем map, так как при использовании forEach нельзя делать return
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
