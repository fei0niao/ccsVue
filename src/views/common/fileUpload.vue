<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <Card>
        <Row>
            <Row>
            <Upload
                ref="upload"
                :headers="util.headers()"
                :show-upload-list="false"
                :on-success="handleSuccess"
                :format="['jpg','jpeg','png']"
                :max-size="200"
                :on-format-error="handleFormatError"
                :on-exceeded-size="handleMaxSize"
                :before-upload="handleBeforeUpload"
                :action="util.ajaxUrl+'/v1/uploadImg'"
                >
                <Button type="ghost" icon="ios-cloud-upload-outline">上传图片</Button>
            </Upload>
            </Row>
            <Row style="padding-top:10px;height:50px">
                <Col span="18">
                <Input type="textarea" :autosize="{minRows: 1,maxRows: 2}" v-model="modelValue"></Input>
                </Col>
                <Col span="5" offset="1">
                <img :src="modelValue" style="height:50px;">
                </Col>
            </Row>
        </Row>
    </Card>
</template>

<script>

    export default {
        name: 'searchable-table',
        props: ['value'],
        data () {
            return {
                imgUrl: '',
                visible: false,
                modelValue: this.value
            };
        },
        methods: {
            handleSuccess (res, file) {
                if (res.status != 1) {
                    return this.$Notice.warning({
                        title: '上传失败',
                        desc: '服务器错误。'
                    });
                }
                file.url = res.data;
                this.modelValue = res.data;
            },
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件 ' + file.name + ' 太大，不能超过 200KB。'
                });
            },
            handleBeforeUpload () {
                const check = this.$refs.upload.fileList.length < 1;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多只能上传 1 张图片。'
                    });
                }
                return check;
            }
        },
        watch: {
            value (val) {
                this.modelValue = val;
            },
            modelValue (val) {
                this.$emit('input', val);
            }
        }
    };
</script>