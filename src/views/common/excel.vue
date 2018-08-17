<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <Tooltip placement="bottom-end">
        <Button type="primary" shape="circle" icon="ios-download-outline" @click="excel_modal = true"></Button>
        <div slot="content"><p>导出excel文件</p></div>
        <Modal
            v-model="excel_modal"
            title="导出excel"
            okText="确定"
            :loading="okloading"
            @on-ok="excelExport()">
            <Form ref="excel" :rules="excelRuler" :model="excelForm" label-position="right" :label-width="100">
                <FormItem>
                    <RadioGroup v-model="excelForm.type">
                        <Radio label="1">当前页</Radio>
                        <Radio label="2">自定义</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="请输入：" v-if="excelForm.type==2">
                    <Row>
                        <Col span="11">
                        <FormItem prop="start">
                            <Input v-model="excelForm.start" placeholder="起始条数"></Input>
                        </FormItem>
                        </Col>
                        <Col span="2" style="text-align: center">
                        -</Col>
                        <Col span="11">
                        <FormItem prop="end">
                            <Input v-model="excelForm.end" placeholder="截止条数"></Input>
                        </FormItem>
                        </Col>
                    </Row>
                </FormItem>
            </Form>
        </Modal>
    </Tooltip>
</template>

<script>

    export default {
        name: 'searchable-table',
        props: ['vm'],
        data () {
            const valideEnd = (rule, value, callback) => {
                if (value < this.excelForm.start) {
                    callback(new Error('截止条数不能小于起始条数'));
                } else if (value - this.excelForm.start > 9999) {
                    callback(new Error('一次性导出条数不能超过10000条'));
                } else {
                    callback();
                }
            };
            return {
                excel_modal: false,
                okloading: true,
                excelRuler: {
                    start: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value)!=='0') ? '' : String(value);
                            }
                        },
                        {
                            type: 'number',
                            min: 1,
                            message: '请输入大于1的数字',
                            trigger: 'change',
                            transform (value) {
                                return Number(value);
                            }
                        }
                    ],
                    end: [
                        {
                            required: true,
                            message: '不能为空',
                            trigger: 'blur',
                            transform (value) {
                                return (!value && String(value)!=='0') ? '' : String(value);
                            }
                        },
                        {
                            type: 'number',
                            min: 1,
                            message: '请输入大于1的数字',
                            trigger: 'change',
                            transform (value) {
                                return Number(value);
                            }
                        },
                        { validator: valideEnd, trigger: 'change' }
                    ]
                },
                excelForm: {
                    type: '1',
                    start: 1,
                    end: ''
                }
            };
        },
        methods: {
            excelExport () {
                if (this.excelForm.type == '1') {
                    this.vm.$refs.table.exportCsv({
                        columns: this.vm.columns.filter((col, index) => col.key !== 'action'),
                        filename: this.vm.$route.meta.title + this.util.dateFMT('yyyy-MM-dd_hh-mm-ss', new Date()),
                        quoted: true,
                        data: this.vm.data
                    });
                    this.excel_modal = false;
                } else {
                    this.$refs.excel.validate((valid) => {
                        if (!valid) {
                            this.okloading = false;
                            this.$nextTick(() => {
                                this.okloading = true;
                            });
                            return;
                        }
                        let params = JSON.parse(JSON.stringify(this.vm.post_data));
                        params.offset = this.excelForm.start - 1;
                        params.limit = this.excelForm.end - this.excelForm.start + 1;
                        this.vm.getList(params).then(res => {
                            this.vm.$refs.table.exportCsv({
                                columns: this.vm.columns.filter((col, index) => col.key !== 'action'),
                                filename: this.vm.$route.meta.title + this.util.dateFMT('yyyy-MM-dd_hh-mm-ss', new Date()),
                                data: res.list
                            });
                        });
                        this.excel_modal = false;
                    });
                }
            }
        }
    };
</script>