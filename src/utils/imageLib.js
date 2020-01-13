const { Image: ImageJs } = require('image-js');

/**
 * @returns array 
 * @param {*} dimensions: Object with defaultValues structure 
 */
const getGridBase = (dimensions) => {
  const defaultValues = {
    container: {
      w: 0,
      h: 0
    },
    region: {
      w: 0,
      h: 0
    }
  };

  const config = Object.assign({}, defaultValues, dimensions);

  const rows = parseInt(config.container.h / config.region.h);
  const cols = parseInt(config.container.w / config.region.w);

  const grid = [];

  for (let indexRows = 0; indexRows < rows; indexRows++) {
    for (let indexCols = 0; indexCols < cols; indexCols++) {
      const cell = {
        row: indexRows,
        column: indexCols,
        x: indexCols * config.region.w,
        y: indexRows * config.region.h,
        w: config.region.w,
        h: config.region.h
      };
      grid.push(cell);
    }
  }
  return Promise.resolve(grid);
};

// eslint-disable-next-line no-alert
const getImageFromFile = async (filePath) => {
  const image = await ImageJs.load(filePath);
  return Promise.resolve(image);
};

// eslint-disable-next-line no-alert
const getImageWithThreshold = async (image, threshold, color) => {
  const newImagen = image.clone();
  const imageGray = newImagen.grey();

  const mask = imageGray.mask({ threshold, invert: true });

  // Paint the pixels from the mask in a color.
  newImagen.paintMasks(mask, { color });

  // Return 
  return Promise.resolve(newImagen);
};

const getAllColorsFromColorHistogram = async (colorHistogramArray) => {
  const data = colorHistogramArray.map((value, index) => {
    return {
      index,
      value
    }
  }).filter(r => r.value > 0);
  return Promise.resolve(data);
};

const getImageFromImage = async (imageFrom, imageData) => {
  const options = {
    x: imageData.x,
    y: imageData.y,
    width: imageData.w,
    height: imageData.h
  };
  const newImage = await imageFrom.clone().crop(options);
  return Promise.resolve(newImage);
};

const getSimilarity = async (imageLeft, imageRight) => {
  return Promise.resolve(await imageLeft.getSimilarity(imageRight));
};

const findImageInImage = async (imageContainer, imageFind, regionW, regionH) => {
  // Build gridData
  const dimensions = {
    container: {
      w: imageContainer.width,
      h: imageContainer.height
    },
    region: {
      w: regionW,
      h: regionH
    }
  };
  const gridData = await getGridBase(dimensions);

  // Colors in image, sorted by number of pixels
  const colorImageFind = await getAllColorsFromColorHistogram(await imageFind.getColorHistogram({ nbSlots: 512 }));
  colorImageFind.sort((a, b) => b.value - a.value);

  // Search in each region
  const findData = [];
  for (let index = 0; index < gridData.length; index++) {
    const item = gridData[index];
    const tmpImage = await getImageFromImage(imageContainer, item);
    const tmpImageColorHistogram = await getAllColorsFromColorHistogram(await tmpImage.getColorHistogram({ nbSlots: 512 }));
    const tmpColor = tmpImageColorHistogram.filter(i => i.index === colorImageFind[0].index);
    const newData = {
      row: item.row,
      column: item.column,
      found: tmpColor.length === 1 ? tmpColor[0].value : 0,
      image: tmpImage
    };
    findData.push(newData);
  }
  return Promise.resolve(findData);

};

module.exports = {
  getGridBase,
  getSimilarity,
  getImageFromFile,
  findImageInImage,
  getImageFromImage,
  getImageWithThreshold,
  getAllColorsFromColorHistogram
};