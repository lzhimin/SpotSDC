#include <math.h>
#include <stdlib.h> 
#include <stdio.h>
/*
 * To run ./pgm <n> <max_iter> <fname>
 */


#include "injector.h"
#include "ftdouble.h"

int dyninst=-1, dynbyte=-1;
int N;
int MAX_ITER; 

void readA(FTDouble** A, FILE *fp);
void readB(FTDouble* b, FILE *fp);
void initX(FTDouble* x);
//void printVec(FTDouble* x);

void matvec(FTDouble** A, FTDouble* p, FTDouble* Ap) {
  int row, col;
  for (row = 0; row < N; ++row) {
    Ap[row] = 0;
    for (col = 0; col < N; ++col) {
      Ap[row] += A[row][col] * p[col]; //corruptDouble(VAR_INFO_ONLY(Ap),&Ap[row]);
    }
  }
}

void waxpby(FTDouble a, FTDouble* x, FTDouble b, FTDouble* y, FTDouble* r) {
  int i;
  for (i = 0; i < N; ++i) {
    r[i] = a * x[i] + b * y[i]; //corruptDouble(VAR_INFO_ONLY(r),&r[i]);
  }
}

void daxpby(FTDouble a, FTDouble* x, FTDouble b, FTDouble* y) {
  int i;
  for (i = 0; i < N; ++i) {
    y[i] = a * x[i] + b * y[i]; //corruptDouble(VAR_INFO_ONLY(y),&y[i]);
  }
}

FTDouble dot_r2(FTDouble* r) {
  FTDouble sum = 0;
  int i;
  for (i = 0; i < N; ++i) {
    sum += r[i]*r[i]; //corruptDouble(VAR_INFO_ONLY(sum),&sum);
  }
  return sum;
}

FTDouble dot(FTDouble* x, FTDouble* y) {
  FTDouble sum = 0;
  int i;
  for (i = 0; i < N; ++i) {
    sum += x[i]*y[i]; //corruptDouble(VAR_INFO_ONLY(sum),&sum);
  }
  return sum;
}

void solve_cg(FTDouble** A, FTDouble* b, FTDouble* x, FTDouble* Ap, FTDouble* p, FTDouble* r) {
  FTDouble normr;
  FTDouble rtrans = 0, oldrtrans = 0;
  FTDouble p_ap_dot = 0;
  //FTDouble alpha = 0;
  FTDouble alpha = 0;
  FTDouble tolerance = 0.06;
  //FTDouble tolerance = 2.22045e-16;
  int k;

  waxpby(1, x, 0, x, p);
  matvec(A, p, Ap);
  waxpby(1, b, -1, Ap, r);
  rtrans = dot_r2(r); //corruptDouble(VAR_INFO_ONLY(rtrans),&rtrans);
  normr = sqrt(rtrans); //corruptDouble(VAR_INFO_ONLY(normr), &normr);

  for (k = 1; k <= MAX_ITER && normr > tolerance; ++k) {
    if (k == 1) {
      waxpby(1, r, 0, r, p);
    } else {
      oldrtrans = rtrans; //corruptDouble(VAR_INFO_ONLY(oldrtrans), &oldrtrans);
      rtrans = dot_r2(r); //corruptDouble(VAR_INFO_ONLY(rtrans), &rtrans);
      FTDouble beta = rtrans/oldrtrans; //corruptDouble(VAR_INFO_ONLY(beta), &beta);
      daxpby(1, r, beta, p);
    }
    normr = sqrt(rtrans); //corruptDouble(VAR_INFO_ONLY(normr), &normr);

    matvec(A, p, Ap);
    p_ap_dot = dot(Ap, p); //corruptDouble(VAR_INFO_ONLY(p_ap_dot), &p_ap_dot);
    alpha = rtrans/p_ap_dot; //corruptDouble(VAR_INFO_ONLY(alpha), &alpha);
    daxpby(alpha, p, 1, x);
    daxpby(-alpha, Ap, 1, r);
  }

  FTDouble golden=1.4175e-02;
  printf("normr: %.4e\n",normr.value);
  printf("iterations: %d\n",k);
  //logTestResult("normrdiff", fabs(golden-normr));
  //printVec(x);
}

int main(int argc, char* argv[]) {
  FTDouble** A;
  FTDouble* b;
  FTDouble* x;

  FTDouble* Ap;
  FTDouble* p;
  FTDouble* r;
  int i;

  //if (argc > 1) {dyninst = atoi(argv[1]); dynbyte=atoi(argv[2]);}
  //if (dyninst != -1 && dynbyte != -1) { logBeginExperimentSet(dyninst, dynbyte); }
  //else {
  //  logBeginExperiment(); }

  N = 8;
  MAX_ITER = 8;
  char* fname = "in8";
  //N = 9261;
  //MAX_ITER = 100;
  //char* fname = "in9261";
//  N = atoi(argv[1]);
//  MAX_ITER = atoi(argv[2]);
//  char* fname = argv[3];

  Ap = (FTDouble *) malloc (N * sizeof(FTDouble));
  p = (FTDouble *) malloc (N * sizeof(FTDouble));
  r = (FTDouble *) malloc (N * sizeof(FTDouble));

  b = (FTDouble *) malloc (N*sizeof(FTDouble));
  x = (FTDouble *) malloc (N*sizeof(FTDouble));
  A = (FTDouble **) malloc (N*sizeof(FTDouble*));
  for (i = 0; i < N; i++) {
    A[i] = (FTDouble *) malloc (N*sizeof(FTDouble));
  }

  //AD_begin();
  FILE *fp = fopen(fname, "r");
  readA(A, fp);
  readB(b, fp);
  initX(x);
  //printf("Read all the inputs\n");

  solve_cg(A, b, x, Ap, p, r);

  //AD_end();
  //AD_report(true);

//  delete [] b;
//  delete [] p;
//  delete [] Ap;
//  delete [] x;
//  delete [] r;
//  for (int i = 0; i < N; ++i) {
//    delete[] A[i];
//  }
//  delete[] A;
}

void readA(FTDouble** A, FILE *fp) {
  int i, j;

  for (i = 0; i < N; i++) {
    for (j = 0; j < N; j++) {
      fscanf(fp, "%lf", &A[i][j]); //corruptDouble(VAR_INFO_ONLY(A),&A[i][j]);
    }
  }
}

void readB(FTDouble* b, FILE *fp) {
  int i;
  for (i = 0; i < N; i++) {
    fscanf(fp, "%lf", &b[i]); //corruptDouble(VAR_INFO_ONLY(b),&b[i]);
  }
}

void initX(FTDouble* x) {
  int i;
  for (i = 0; i < N; ++i) {
    x[i] = 0;
  }
}

//void printVec(FTDouble* x) {
//  int i;
//  for (i = 0; i < N; i++) {
//    printf("%lf ",x[i]);
//  }
//  printf("\n");
//}
