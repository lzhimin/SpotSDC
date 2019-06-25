#!/bin/bash

#g++ -c logger.cpp
echo 0 >> expno.log
g++ miniFE.c

for ((i=0; i<8; i++)); do
  for ((b=0; b<64; b++)); do
    #bb=$(expr 2 + $b \* 4)
    ./a.out $i $b
  done
done
