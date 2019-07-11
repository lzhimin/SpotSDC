#ifndef FT_DOUBLE_H
#define FT_DOUBLE_H

#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <pthread.h>
#include <getopt.h>
#include <string>
#include <unistd.h>
#include <string.h>


FILE *dependlog;

void LogDependency() {
  char s[100];
  char buf[100];
  int expno = -1;

  sprintf(buf, "%d", expno);
  strcpy(s, "dependency_");
  strcat(s, buf);
  strcat(s, ".log");
  dependlog = fopen(s, "w");
  fprintf(dependlog, "\n");
}

class FTDouble {
  public:
  int lineno;
  double value;
  
  //std::string fileinfo;
  char* fileinfo;

  FTDouble() : value(0.0), lineno(__LINE__), fileinfo(__FILE__) { }

  FTDouble(double v) : value(v), lineno(__LINE__), fileinfo(__FILE__) { }

  FTDouble(double v, int lno, char* finfo) : value(v), lineno(lno), fileinfo(finfo) { }

  FTDouble(const FTDouble &obj) {
    value = obj.value;
    lineno = obj.lineno;
    fileinfo = obj.fileinfo;
  }

  ~FTDouble() {
  }


  FTDouble operator=(const FTDouble &rhsoper) {
    FTDouble obj;
    obj.value = rhsoper.value;

    fprintf(dependlog, "%s:%d depends %s:%d\n", __FILE__, __LINE__, rhsoper.fileinfo, rhsoper.lineno);


    return obj;
  }

  FTDouble operator=(const double &a) {
    FTDouble obj;
    obj.value = a;
    
    return obj;
  }

  FTDouble operator=(const float &a) {
    FTDouble obj;
    obj.value = a;
    
    return obj;
  }

  FTDouble operator=(const int &a) {
    FTDouble obj;
    obj.value = a;
    
    return obj;
  }

  FTDouble operator*(const double rhs) {
    FTDouble obj;

    obj.value = value * rhs;
    return obj;
  }

  FTDouble operator*(const FTDouble &rhs) {
    FTDouble obj;

    obj.value = value * rhs.value;
    return obj;
  }



  FTDouble operator+(const FTDouble &rhs) {
    FTDouble obj;
    obj.value = value + rhs.value;
    return obj;
  }

  FTDouble operator/(const FTDouble &rhs) {
    FTDouble obj;
    obj.value = value / rhs.value;
    return obj;
  }

  FTDouble operator-(const FTDouble &rhs) {
    FTDouble obj;
    obj.value = value - rhs.value;
    return obj;
  }

  FTDouble operator-() {
    FTDouble obj;
    obj.value = -value;
    return obj;
  }

  FTDouble& operator+=(const FTDouble &rhs) {
    this->value += rhs.value;
    return *this;
  }

  bool operator<(const FTDouble &rhs) {
    return value < rhs.value;
  }

  bool operator>(const FTDouble &rhs) {
    return value > rhs.value;
  }
};

FTDouble sqrt(const FTDouble &rhs) {
  FTDouble obj;
  obj.value = sqrt(rhs.value);

  return obj;
}

#endif
