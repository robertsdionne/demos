# Copyright 2010 Robert Scott Dionne. All Rights Reserved.
#
# Generates Javascript dependencies.
../closure-library/closure/bin/build/depswriter.py \
  --root_with_prefix=". ../../../ray/" \
  --output_file=deps.js