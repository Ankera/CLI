#!/bin/bash

# 获取脚本所在的目录
script_dir=$(dirname "$0")

# 构建目标目录的路径
target_directory="$script_dir/aaa"

# 使用 cd 命令进入目标目录
cd "$target_directory"

# 显示进入的文件夹
echo "进入了文件夹: $(pwd)"
