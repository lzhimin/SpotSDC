#ifndef FILE_INJECTOR_H
#define FILE_INJECTOR_H

#include <stdio.h>
#include <math.h>
#include <stdlib.h>
#include <pthread.h>
#include <getopt.h>
#include <string.h>
#include <unistd.h>



#define SRC_VAR_INFO(x) __FILE__, __LINE__, __func__, #x 
#define VAR_INFO_ONLY(x) __FILE__, __LINE__, __func__, #x, "i", dyninst 

#define RAND_FN random()

//std::ofstream injection_logfile("injectlog.log", std::fstream::out | std::fstream::app);
FILE *injectfp;
FILE *expfp;
FILE *statelogfp;

int should_inject = 0;
int fault_injected = 0;
int error_free = 0;
int inject_dyn_call = -1;
int inject_dyn_bit = -1;
int dyn_call = -1;
int expno = -1;

unsigned int MSBPos(long i) {
  unsigned int r = 0; // r will be lg(v)

  while (i >>= 1) {
    r++;
  }
  return r;
}

void* faultNotified(void* shdinject) {
  inject_dyn_call = rand() % 85499;
//  //should_inject = 1;
//  //long cl = time(NULL);
//  //srand(cl);
//  //double execTimeS = *((double*)data);
//  double execTimeS = atof(getenv("APP_EXEC_TIME_S"));
//  int* inject = (int *)shdinject;
//  // double random number between 0 and 1
//  double injFrac = RAND_FN / ((double)RAND_MAX);
//  printf("execTimeS=%le, injFrac=%le, will inject in %le seconds.\n", execTimeS, injFrac, injFrac * execTimeS);
//  usleep((int)(injFrac * execTimeS*1000000));
//  //should_inject = 1;
//  *inject = 1;
//  printf("Injected fault after %le seconds.\n", injFrac * execTimeS);
//  //return NULL;
  pthread_exit(NULL);
}


void set_injection_dyn (void) __attribute__((constructor));

void set_injection_dyn (void) {
  unsigned int seed;
  FILE* urandom = fopen("/dev/urandom", "r");
  fread(&seed, sizeof(int), 1, urandom);
  fclose(urandom);
  srandom(seed);
  if (inject_dyn_call == -1) {
    //inject_dyn_call = (random() % 118) + 1;
    //inject_dyn_call = (random() % 59) + 1;
    //inject_dyn_call = (random() % 81) + 1;
    //inject_dyn_call = (random() % 260) + 1;

    //inject_dyn_call = (random() % 24) + 1;
    //inject_dyn_call = (random() % 2902) + 1;
    //inject_dyn_call = (random() % 40) + 1;
    //inject_dyn_call = (random() % 40) + 1;
  }
  //printf("set inject_dyn_call %d\n", inject_dyn_call);
}

void end_experiment (void) __attribute__((destructor));

void end_experiment (void) {
  printf ("End experiment\n");
  //injection_logfile << "\n";
  //injection_logfile.close();
}
//void StartThreadToNotifyFault() {
//  should_inject = 0;
//  fault_injected = 0;
//  printf("Start thread to notify fault\n");
//  pthread_t faultThr;
//  double execTimeS = atof(getenv("APP_EXEC_TIME_S"));
//  int ret = pthread_create(&faultThr, NULL, faultNotified, &should_inject);
//  if(ret!=0) { printf("ERROR creating fault notification thread!"); exit(1); }
//}

void LogCallGraph() {
  //for (int i = 0; i < logger.call_graph.size(); i++) {
  //  injection_logfile << logger.call_graph[i] << "#";
  //}
  //injection_logfile << " ";
}

void LogContext(const char* local_ctx, int local_ctx_val) {
  //for (int i = 0; i < logger.cntx_name.size(); i++) {
  //  injection_logfile << logger.cntx_name[i] << "#"<<logger.cntx_val[i]<<"#";
  //}
  //injection_logfile << local_ctx << "#" << local_ctx_val << " ";
  fprintf(injectfp, "%s#%d ", local_ctx, local_ctx_val);
}

//void corruptIntMax(const char* fname, int lineno, const char* fnname, const char* vname, const char* ctx, int ctx_val, int *i, int max) {
//  dyn_call++;
//  if (dyn_call == inject_dyn_call) {
//  //if (should_inject && !fault_injected) {
//    //srand(time(NULL));
//    int r = RAND_FN;
//    long beforei = *i;
//    long mask = 1;
//    unsigned int msb = MSBPos(max);
//    mask <<= r%msb;
//    *i = *i ^ mask;
//    fault_injected = 1;
//    printf("Corrupted %ld to %ld mask %ld within max %ld msb %d\n", beforei, *i, mask, max, msb);
//   // std::ifstream exp_nofile("expno.log");
//   // int expno;
//   // exp_nofile >> expno;
//    //injection_logfile << expno << " " << fname << ":" << lineno << " ";
//    fprintf(injectfp, "%d %s:%d ",expno, fname, lineno);
//    //LogCallGraph(logger);
//    //LogContext(logger, ctx, ctx_val);
//    //injection_logfile << "Corrupted " << beforei << " to " << *i << " mask " << mask << " max " << max << " msb " << msb << " ";
//    fprintf(injectfp, "Corrupted %d to %d mask %d max %d msb %d ", beforei, *i, mask, max, msb);
//    //exp_nofile.close();
//  }
//}



//void corruptIntMax(const char* fname, int lineno, const char* fnname, const char* vname, const char* ctx, int ctx_val, long *i, long max) {
//  dyn_call++;
//  if (dyn_call == inject_dyn_call) {
//  //if (should_inject && !fault_injected) {
//    //srand(time(NULL));
//    int r = RAND_FN;
//    long beforei = *i;
//    long mask = 1;
//    unsigned int msb = MSBPos(max);
//    mask <<= r%msb;
//    *i = *i ^ mask;
//    fault_injected = 1;
//    printf("Corrupted %ld to %ld mask %ld within max %ld msb %d\n", beforei, *i, mask, max, msb);
//    std::ifstream exp_nofile("expno.log");
//    int expno;
//    exp_nofile >> expno;
//    injection_logfile << expno << " " << fname << ":" << lineno << " ";
//    LogCallGraph(logger);
//    LogContext(logger, ctx, ctx_val);
//    injection_logfile << "Corrupted " << beforei << " to " << *i << " mask " << mask << " max " << max << " msb " << msb << " ";
//    exp_nofile.close();
//  }
//}

//void corruptIntMax(const char* fname, int lineno, const char* fnname, const char* vname, const char* ctx, int ctx_val, long* i, long max) {
//  corruptIntMax(fname, lineno, fnname, vname, ctx, ctx_val, logger, i, max);
//}
//
//void corruptIntMax(const char* fname, int lineno, const char* fnname, const char* vname, long *i, long max) {
//  corruptIntMax(fname, lineno, fnname, vname, "", -1, logger, i, max);
//}
//
//
//void corruptIntMax(const char* fname, int lineno, const char* fnname, const char* vname, long* i, long max) {
//  corruptIntMax(fname, lineno, fnname, vname, "", -1, logger, i, max);
//}

void corruptFloat(const char* fname, int lineno, const char* fnname, const char* vname, const char* ctx, int ctx_val, float* value) {
//  dyn_call++;
//  if (dyn_call == inject_dyn_call) {
//  //if (should_inject && !fault_injected) {
//    double beforei = value;
//    long mask=1;
//    mask <<= RAND_FN%32;
////    value = (double)(((long)value) ^ mask);
//    fault_injected = 1;
//    
//    long* val_ptr = (long* ) &value;
//    int tmp  = (*val_ptr ^ mask);
//    float*pf = (float*)&tmp;
//    value = *pf;
//
//
//    std::ifstream exp_nofile("expno.log");
//    int expno;
//    exp_nofile >> expno;
//    injection_logfile << expno << " " << fname << ":" << lineno << " ";
//    LogCallGraph(logger);
//    LogContext(logger, ctx, ctx_val);
//    printf("Corrupted %lf to %lf mask %ld\n", beforei, value, mask );
//    injection_logfile << "Corrupted " << beforei << " to " << value << " mask " << mask << " ";
//    exp_nofile.close();
//  }
//
}

void corruptDouble(const char* fname, int lineno, const char* fnname, const char* vname, const char* ctx, int ctx_val, double* value) {

  dyn_call++;
  if (dyn_call == inject_dyn_call) {
  //if (should_inject && !fault_injected) {
    double beforei = *value;

    if (inject_dyn_bit == -1) {
      inject_dyn_bit = RAND_FN % 64;
    }
    long long mask=1;
    //inject_dyn_bit = 51;
    mask <<= inject_dyn_bit;
    fault_injected = 1;
    
    long long* val_ptr = (long long* ) value;
    long long tmp  = (*val_ptr ^ mask);
    double*pd = (double*)&tmp;
    *value = *pd;
    //value += 0.01;


//    std::ifstream exp_nofile("expno.log");
//    int expno = -1;
//    exp_nofile >> expno;
//    //injection_logfile << expno << " " << fname << ":" << lineno << " ";
//    injection_logfile << expno << " " << fname << ":" << lineno << " " << vname << " ";
    fprintf(injectfp, "%d %s %d %s ", expno, fname, lineno, vname);
//    LogCallGraph(logger);
    LogContext(ctx, ctx_val);
    int expo;
    frexp (beforei , &expo);
    //printf("Corrupted %.16f to %.16f mask %08x dyninst %d bit %d\n", beforei, *value, mask, inject_dyn_call, inject_dyn_bit);
    printf("Corrupted %.16f to %.16f mask %016llx dyninst %d bit %d\n", beforei, *value, mask, inject_dyn_call, inject_dyn_bit);
    //injection_logfile << std::setprecision(15) << "Corrupted " << beforei << " to " << value << " mask " << mask << " " << " exp " << expo << " ";
    //injection_logfile << "Corrupted " << beforei << " to " << value << " mask " << mask << " ";
//    exp_nofile.close();
    fprintf(injectfp, "Corrupted %.16f to %.16f mask %016llx expo %d ", beforei, *value, mask, expo);
  }
  fprintf(statelogfp, "%s %d %s %.16f\n", fname, lineno, vname, *value);

}

//void corruptDouble(const char* fname, int lineno, const char* fnname, const char* vname, double* value) {
//  corruptDouble(fname, lineno, fnname, vname, "", -1, logger, value);
//}

//void corruptVectorDouble(const char* fname, int lineno, const char* fnname, const char* vname, const char* ctx, int ctx_val, std::vector<double>& vec) {
//  dyn_call++;
//  if (dyn_call == inject_dyn_call) {
//  //if (should_inject && !fault_injected) {
//    int err_idx = RAND_FN%vec.size();
//    //logger.AddContext("index", err_idx);
//    dyn_call--;
//    corruptDouble(fname, lineno, fnname, vname, ctx, ctx_val, logger, vec[err_idx]);
//    //logger.RemoveContext();
//  }
//}

void corruptArrayDouble(const char* fname, int lineno, const char* fnname, const char* vname, const char* ctx, int ctx_val, double* vec, int size) {
  dyn_call++;
  if (dyn_call == inject_dyn_call) {
  //if (should_inject && !fault_injected) {
    int err_idx = RAND_FN%size;
    //logger.AddContext("index", err_idx);
    dyn_call--;
    corruptDouble(fname, lineno, fnname, vname, ctx, ctx_val, &vec[err_idx]);
    //logger.RemoveContext();
  }
}
void logTestResult(const char* res, double diff) {
//    int expno;
//    exp_nofile >> expno;
  printf("Total dyn instructions %d\n", dyn_call);
   // injection_logfile << std::setprecision(15) << res << " " << diff << " ";
  fprintf(injectfp, "%s %.16f ", res, diff);
}

//void logTestResult(double diff) {
////    int expno;
////    exp_nofile >> expno;
//  logTestResult("Maxdiff", diff);
//}

//void logVecTestResult(const char* res, std::vector<double> vec_x) {
////    int expno;
////    exp_nofile >> expno;
////    injection_logfile << std::fixed << std::setprecision(8) << res << " ";
////    for (int i = 0; i < vec_x.size(); i++) {
////      injection_logfile << vec_x[i] << " ";
////    }
//}

void logBeginExperiment() {
  injectfp = fopen("injectlog.log", "a+");
  fprintf(injectfp, "\n");
  expfp = fopen("expno.log", "r+");
  fscanf(expfp, "%d", &expno);
  fclose(expfp);
  expfp = fopen("expno.log", "w");
  printf("EXP no %d\n", expno);
  fprintf(expfp, "%d", expno+1);
  fclose(expfp);

  char s[100];
  char buf[100];
  sprintf(buf, "%d", expno);
  strcpy(s, "appstate_");
  strcat(s, buf);
  strcat(s, ".log");
  statelogfp = fopen(s, "w");
  //injection_logfile << "\n";
}

void logBeginExperimentSet(int dyninst, int dynbit) {
  inject_dyn_call = dyninst;
  inject_dyn_bit = dynbit;
//  //injection_logfile << "\n";
  printf("Going to inject %d bit %d\n", inject_dyn_call, inject_dyn_bit);
  logBeginExperiment();
}



//void corruptInt(long *i) {
//  dyn_call++;
//  if (dyn_call == inject_dyn_call) {
//  //if (should_inject && !fault_injected) {
//    long beforei = *i;
//    long mask = 1;
//    if (inject_dyn_bit == -1) {
//      inject_dyn_bit = RAND_FN % 32;
//    }
//    mask <<= inject_dyn_bit;
//    *i = *i ^ mask;
//    fault_injected = 1;
//    printf("Corrupted %ld to %ld mask %ld\n", beforei, *i, mask);
//  }
//}




#endif
