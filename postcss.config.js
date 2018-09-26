/*!
 * Postcss config
 * xiewulong <xiewulong@vip.qq.com>
 * create: 2018/07/25
 * since: 0.0.1
 */
'use strict';

const path = require('path');

module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-sprites')({
      retina: true,
      spritePath: './src/images/',
      filterBy(image) {
        let group = /\/images\/([^\/]+)\/[^\/]+\.[^\/]+$/i.exec(image.path);

        return Promise[ group ? 'resolve' : 'reject' ]();
      },
      groupBy(image) {
        let group = /\/images\/([^\/]+)\/[^\/]+\.[^\/]+$/i.exec(image.path);

        return group ? Promise.resolve(group[1]) : Promise.reject();
      },
      hooks: {
        onSaveSpritesheet(opts, spritesheet) {
          return path.join(opts.spritePath, `${spritesheet.groups.reverse().join('')}.${spritesheet.extension}`);
        },
      },
    }),
  ],
};
