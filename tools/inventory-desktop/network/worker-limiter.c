/* SPDX-License-Identifier: MIT
 * Cyber-Skill SNMP worker: bounded lifetime/memory, inherited pipes, no shell.
 */
#ifdef _WIN32
#define UNICODE
#define _UNICODE
#include <windows.h>
#include <wchar.h>
#include <stdlib.h>
static wchar_t *quote(wchar_t *out,const wchar_t *s){
 *out++=L'"';while(*s){unsigned n=0;while(*s==L'\\'){n++;s++;}if(!*s){while(n--){*out++=L'\\';*out++=L'\\';}break;}
 if(*s==L'"'){while(n--){*out++=L'\\';*out++=L'\\';}*out++=L'\\';*out++=*s++;}else{while(n--)*out++=L'\\';*out++=*s++;}}
 *out++=L'"';return out;
}
int wmain(int argc,wchar_t **argv){
 if(argc<3)return 2;size_t size=1;for(int i=1;i<argc;i++)size+=2*wcslen(argv[i])+4;
 if(size>32760)return 2;wchar_t *line=calloc(size,sizeof(wchar_t));if(!line)return 2;wchar_t *p=line;
 for(int i=1;i<argc;i++){if(i>1)*p++=L' ';p=quote(p,argv[i]);}*p=0;
 HANDLE job=CreateJobObjectW(NULL,NULL);if(!job){free(line);return 2;}
 JOBOBJECT_EXTENDED_LIMIT_INFORMATION limits={0};limits.BasicLimitInformation.LimitFlags=JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE|JOB_OBJECT_LIMIT_PROCESS_MEMORY|JOB_OBJECT_LIMIT_ACTIVE_PROCESS|JOB_OBJECT_LIMIT_PROCESS_TIME;
 limits.BasicLimitInformation.ActiveProcessLimit=1;limits.BasicLimitInformation.PerProcessUserTimeLimit.QuadPart=60LL*10000000LL;limits.ProcessMemoryLimit=512ULL*1024ULL*1024ULL;
 if(!SetInformationJobObject(job,JobObjectExtendedLimitInformation,&limits,sizeof(limits))){CloseHandle(job);free(line);return 2;}
 STARTUPINFOW si={0};si.cb=sizeof(si);si.dwFlags=STARTF_USESTDHANDLES;si.hStdInput=GetStdHandle(STD_INPUT_HANDLE);si.hStdOutput=GetStdHandle(STD_OUTPUT_HANDLE);si.hStdError=GetStdHandle(STD_ERROR_HANDLE);PROCESS_INFORMATION pi={0};
 if(!CreateProcessW(argv[1],line,NULL,NULL,TRUE,CREATE_SUSPENDED|CREATE_NO_WINDOW,NULL,NULL,&si,&pi)){CloseHandle(job);free(line);return 2;}free(line);
 if(!AssignProcessToJobObject(job,pi.hProcess)){TerminateProcess(pi.hProcess,2);CloseHandle(pi.hThread);CloseHandle(pi.hProcess);CloseHandle(job);return 2;}
 ResumeThread(pi.hThread);DWORD wait=WaitForSingleObject(pi.hProcess,90000),status=2;if(wait==WAIT_OBJECT_0)GetExitCodeProcess(pi.hProcess,&status);
 CloseHandle(pi.hThread);CloseHandle(pi.hProcess);CloseHandle(job);return(int)status;
}
#else
#include <sys/resource.h>
#include <unistd.h>
#include <signal.h>
#ifdef __APPLE__
#include <libproc.h>
#include <sys/wait.h>
#include <stdlib.h>
#endif
#ifdef __linux__
#include <sys/prctl.h>
#endif
static int bound(int resource,rlim_t value){struct rlimit limit={value,value};return setrlimit(resource,&limit);}
int main(int argc,char **argv){
 if(argc<3)return 2;
 if(bound(RLIMIT_CPU,60)||bound(RLIMIT_NOFILE,256)||bound(RLIMIT_FSIZE,1024ULL*1024ULL))return 2;
#ifdef __linux__
 if(bound(RLIMIT_AS,512ULL*1024ULL*1024ULL))return 2;
 if(prctl(PR_SET_NO_NEW_PRIVS,1,0,0,0))return 2;
#endif
#ifdef __APPLE__
 /* Darwin does not enforce RLIMIT_AS. Supervise resident memory every 100 ms. */
 pid_t child=fork();if(child<0)return 2;if(child==0){alarm(90);execv(argv[1],argv+1);_exit(2);}
 for(int i=0;i<900;i++){
  int status=0;pid_t result=waitpid(child,&status,WNOHANG);if(result==child)return WIFEXITED(status)?WEXITSTATUS(status):2;if(result<0)return 2;
  struct proc_taskinfo info;int bytes=proc_pidinfo(child,PROC_PIDTASKINFO,0,&info,sizeof(info));
  if(bytes!=(int)sizeof(info)||info.pti_resident_size>512ULL*1024ULL*1024ULL)break;
  usleep(100000);
 }
 kill(child,SIGKILL);waitpid(child,NULL,0);return 2;
#else
 alarm(90);execv(argv[1],argv+1);return 2;
#endif
}
#endif
