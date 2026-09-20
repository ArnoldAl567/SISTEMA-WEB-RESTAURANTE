module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['ChromeHeadlessNoGpu'],
    customLaunchers: {
      ChromeHeadlessNoGpu: {
        base: 'ChromeHeadless',
        flags: ['--disable-gpu', '--disable-gpu-compositing', '--disable-software-rasterizer', '--no-sandbox', '--disable-features=Vulkan'],
      },
    },
  });
};
