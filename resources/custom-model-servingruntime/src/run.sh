#!/bin/bash
if [ ${CONFIG_PATH} ] || [[ ${MODEL_PATH} && ${CONFIG_PATH} ]]; then
    python -m llama_cpp.server --config_file ${CONFIG_PATH}
    exit 0
fi

if [ ${MODEL_PATH} ]; then
    python -m llama_cpp.server --model ${MODEL_PATH}/* --host ${HOST:=0.0.0.0} --port ${PORT:=8001} --n_gpu_layers ${GPU_LAYERS:=0} --clip_model_path ${CLIP_MODEL_PATH:=None} --chat_format ${MODEL_CHAT_FORMAT:="llama-2"} --interrupt_requests ${INTERRUPT_REQUESTS:=False} --n_ctx 4096
    exit 0
fi

echo "Please set either a CONFIG_PATH or a MODEL_PATH"
exit 1
