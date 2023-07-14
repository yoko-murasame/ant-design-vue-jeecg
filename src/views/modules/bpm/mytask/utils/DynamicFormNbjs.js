/**
 * 动态表单相关实现逻辑抽取-内部结算
 * 这里专门针对字段：联系单（内部结算）
 * @date 2022.04.28
 */
export default {
  data() {
    return {
      dynamicIdNbjs: 0 // 动态表单id-内部结算联系单
    }
  },
  methods: {
    /**
     * 计算动态表单的值
     */
    dynamicCalcuteNbjs(e, k, index, type) {
      // 动态计算时，动态表单的项会有点问题，需要额外处理
      const keys = this.form.getFieldValue('keysNbjs');
      // 拿出分项数据
      const lxdjeParts = [];
      const lxdbhParts = [];
      keys.map((key, idx) => {
        let lxdjePart = this.form.getFieldValue(`${key}lxdje`);
        lxdjePart = lxdjePart && (lxdjePart - 0) || 0;
        let lxdbhPart = this.form.getFieldValue(`${key}lxdbh`);
        lxdbhPart = lxdbhPart || null;
        // 需要注意当前change值是不同的
        lxdjeParts.push(type === 'lxdje' && key === k ? parseFloat(e) : lxdjePart);
        lxdbhParts.push(type === 'lxdbh' && key === k ? e : lxdbhPart)
      });
      // 回填合同总金额、分项金额数据、分项类型数据
      this.form.setFieldsValue({
        nbjsLxdje: lxdjeParts.join(','),
        nbjsLxdbh: lxdbhParts.join(',')
      });
      console.log(e, k, index, lxdjeParts, lxdbhParts);
      // 去计算共增减
      this.calculateAllNbjs()
    },
    /**
     * 动态增减表单项
     */
    dynamicAddNbjs() {
      const { form } = this;
      const keys = form.getFieldValue('keysNbjs');
      const nextKeys = keys.concat(this.dynamicIdNbjs++);
      form.setFieldsValue({
        keysNbjs: nextKeys
      });
    },
    dynamicRemoveNbjs(k) {
      const { form } = this;
      const keys = form.getFieldValue('keysNbjs');
      // if (keys.length === 1) {
      //   return;
      // }
      form.setFieldsValue({
        keysNbjs: keys.filter(key => key !== k)
      });
      this.dynamicCalcuteNbjs(0, k)
    },
    /**
     * 初始化动态表单
     * 为什么 getFieldDecorator 和 setFieldsValue 一起出现？
     * 1.getFieldDecorator API是在表单没有这个字段时自动初始化的
     * 2.如果表单已经有这个formItemId时，调用 getFieldDecorator API将不能改变值
     * 3.此时需要通过 setFieldsValue API重新赋值，达到回显效果
     */
    dynamicInitNbjs() {
      const { nbjsLxdbh, nbjsLxdje } = this.model;
      const nbjsLxdjeArr = (nbjsLxdje && nbjsLxdje.split(',')) || [];
      const nbjsLxdbhArr = (nbjsLxdbh && nbjsLxdbh.split(',')) || [];
      console.log('dynamicInitNbjs::', nbjsLxdjeArr, nbjsLxdbhArr);
      this.dynamicIdNbjs = nbjsLxdjeArr.length;
      this.form.getFieldDecorator('keysNbjs', {
        initialValue: nbjsLxdjeArr.map((v, i) => i),
        preserve: true
      });
      this.form.setFieldsValue({
        keysNbjs: nbjsLxdjeArr.map((v, i) => i)
      });
      // 需要新增两个隐藏表单项
      this.form.getFieldDecorator('nbjsLxdje', { initialValue: nbjsLxdje, preserve: true });
      this.form.getFieldDecorator('nbjsLxdbh', { initialValue: nbjsLxdbh, preserve: true });
      // 回填动态项的值
      nbjsLxdjeArr.forEach((v, i) => {
        const formItemId = `${i}lxdje`;
        this.form.getFieldDecorator(formItemId, {
          initialValue: v,
          preserve: true
        });
        this.form.setFieldsValue({
          [formItemId]: v
        })
      });
      nbjsLxdbhArr.forEach((v, i) => {
        const formItemId = `${i}lxdbh`;
        this.form.getFieldDecorator(formItemId, {
          initialValue: v,
          preserve: true
        });
        this.form.setFieldsValue({
          [formItemId]: v
        })
      })
      // Todo 回填计算所有金额值
      // this.form.setFieldsValue({ contractMoney: otherMoneyPartsArr.reduce((pre, cur) => pre + (cur - 0), 0).toFixed(4) })
    }
  }
}
