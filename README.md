### topic-dependence-visualization

> 需要将[`facetTree.js`](https://github.com/wkw307/facet-tree-visualization/releases)放在`/module/facetTree.js`位置，`/module`文件夹需要新建

`/config/webpack.config.dev.js` 打包知识森林可视化模块的配置，打包结果生成在`/module/topicDependenceVisualization.js`，打包命令`npm run build`

#### `topicDependenceVisualization.js`模块

`drawMap(svg, treesvg, domainName, learningPath, clickTopic, clickFacet)`

- `svg` 显示认知关系的svg元素，需要设置宽高
- `treesvg` 显示分面树的svg元素，不要设置宽高，但需要使其浮于认知关系图之上
- `learningPath: number[]` 知识主题id列表，用来显示推荐认知路径，目前后端未支持
- `clickTopic(topicId: number, topicName: string)` 点击知识主题的响应函数
- `clickFacet(facetId: number)` 点击分面的响应函数