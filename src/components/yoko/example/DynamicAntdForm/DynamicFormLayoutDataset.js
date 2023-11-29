/**
 * 动态表单相关实现逻辑抽取-数据集名称
 */
export default {
  data() {
    return {
      // 动态字段名称
      dynamicFieldsForLayoutDataset: ['layoutDataset', 'layoutDatasetType'],
      // 作为key的字段名称
      dynamicKeyFieldsForLayoutDataset: ['keysLayoutDataset', 'keysLayoutDatasetType'],
      // 动态表单id
      dynamicIdsForLayoutDataset: [0, 0],
      // 作为动态字段的名称后缀
      dynamicNameSuffixesForLayoutDataset: ['_layoutDataset', '_layoutDatasetType']
    }
  },
  methods: {
    /**
     * 计算动态表单的值
     */
    dynamicCalculateMultiFieldsForLayoutDataset(e, k, index, type) {
      const { form } = this;
      for (let i = 0; i < this.dynamicFieldsForLayoutDataset.length; i++) {
        const dynamicKeyFieldOne = this.dynamicKeyFieldsForLayoutDataset[i]
        const dynamicNameSuffixOne = this.dynamicNameSuffixesForLayoutDataset[i]
        const dynamicFieldOne = this.dynamicFieldsForLayoutDataset[i]
        // 动态计算时，动态表单的项会有点问题，需要额外处理
        const keys = form.getFieldValue(dynamicKeyFieldOne);
        // 拿出分项数据
        const fieldOneItems = [];
        keys.forEach(key => {
          let namePart = form.getFieldValue(`${key}${dynamicNameSuffixOne}`);
          namePart = namePart || null;
          // 需要注意当前change值是不同的
          fieldOneItems.push(type === dynamicNameSuffixOne && key === k ? e : namePart)
        });
        // 回填分项数据
        form.setFieldsValue({
          [dynamicFieldOne]: fieldOneItems.join(',')
        });
        console.log(e, k, index, fieldOneItems);
      }
    },
    /**
     * 动态增减表单项
     */
    dynamicAddMultiFieldsForLayoutDataset() {
      const { form, dynamicIdsForLayoutDataset } = this;
      for (let i = 0; i < this.dynamicFieldsForLayoutDataset.length; i++) {
        const dynamicKeyFieldOne = this.dynamicKeyFieldsForLayoutDataset[i]
        const keys = form.getFieldValue(dynamicKeyFieldOne);
        const nextKeys = keys.concat(dynamicIdsForLayoutDataset[i]++);
        form.setFieldsValue({
          [dynamicKeyFieldOne]: nextKeys
        });
      }
    },
    dynamicRemoveMultiFieldsForLayoutDataset(k) {
      const { form } = this;
      for (let i = 0; i < this.dynamicFieldsForLayoutDataset.length; i++) {
        const dynamicKeyFieldOne = this.dynamicKeyFieldsForLayoutDataset[i]
        const keys = form.getFieldValue(dynamicKeyFieldOne);
        form.setFieldsValue({
          [dynamicKeyFieldOne]: keys.filter(key => key !== k)
        });
      }
      this.dynamicCalculateMultiFieldsForLayoutDataset(0, k)
    },
    /**
     * 初始化动态表单
     * 为什么 getFieldDecorator 和 setFieldsValue 一起出现？
     * 1.getFieldDecorator API是在表单没有这个字段时自动初始化的
     * 2.如果表单已经有这个formItemId时，调用 getFieldDecorator API将不能改变值
     * 3.此时需要通过 setFieldsValue API重新赋值，达到回显效果
     */
    dynamicInitMultiFieldsForLayoutDataset() {
      const { form, model, dynamicIdsForLayoutDataset } = this;
      for (let i = 0; i < this.dynamicFieldsForLayoutDataset.length; i++) {
        const dynamicKeyFieldOne = this.dynamicKeyFieldsForLayoutDataset[i]
        const dynamicNameSuffixOne = this.dynamicNameSuffixesForLayoutDataset[i]
        const dynamicFieldOne = this.dynamicFieldsForLayoutDataset[i]
        // 开始处理各个子字段
        const fieldValueOne = model[dynamicFieldOne]
        const fieldValueOneArray = (fieldValueOne && fieldValueOne.split(',')) || [];
        dynamicIdsForLayoutDataset[i] = fieldValueOneArray.length;
        console.log('dynamicInit::', dynamicFieldOne, fieldValueOneArray);
        form.getFieldDecorator(dynamicKeyFieldOne, {
          initialValue: fieldValueOneArray.map((v, i) => i),
          preserve: true
        });
        form.setFieldsValue({
          [dynamicKeyFieldOne]: fieldValueOneArray.map((v, i) => i)
        });
        // 需要新增1个隐藏表单项
        form.getFieldDecorator(dynamicFieldOne, { initialValue: fieldValueOne, preserve: true });
        // 回填动态项的值
        fieldValueOneArray.forEach((v, i) => {
          const formItemId = `${i}${dynamicNameSuffixOne}`;
          form.getFieldDecorator(formItemId, {
            initialValue: v,
            preserve: false
          });
          form.setFieldsValue({
            [formItemId]: v
          })
        })
      }
    }
  }
}
