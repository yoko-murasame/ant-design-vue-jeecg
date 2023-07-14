const AiTestOnlineMixin = Object.assign({
  data() {
    return {
      aiTestMode: false,
      aiTestTable: [],
      aiTableList: []
    }
  },
  create() {
  },
  methods: {
    initVirtualData() {
    },
    // 自定义按钮
    genButtons() {
    },
    // 生成java增强
    genEnhanceJavaData() {
    },
    // 生成js增强
    genEnhanceJsData() {
    },
    // 自定义sql增强
    genEnhanceSqlData() {
    },
    /**
     * 加载配置信息
     */
    setTaleConfig() {
    },
    tableJsonGetHelper() {
    },
    /**
     * json 获取小助手
     * @param fields
     */
    fieldsJsonGetHelper() {
    },
    refreshCacheTableName() {
    }
  }

});

export {
  AiTestOnlineMixin
}
