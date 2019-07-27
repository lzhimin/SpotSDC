#!/bin/bash

#g++ -c logger.cpp
echo 0 >> expno.log
gcc -g fft.c -o fft -lm -pthread

for ((i=0; i<10; i++)); do
  for ((b=0; b<64; b++)); do
    #bb=$(expr 2 + $b \* 4)
    ./fft -d $i -b $b -t
  done
done
