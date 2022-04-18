const core = require("@actions/core");

exports.addLinks = (links) => (entry) => {
  const { text } = entry;
  const [, ...usedLinks] = /(\[.+\])\[\]/g.exec(text) || [];

  let tempText = `${text}`;
  for (const usedLink of usedLinks) {
    const link = links.find((element) => element.includes(usedLink));

    tempText = `${tempText}

    ${link}`;
  }

  return { ...entry, text: tempText };
};
