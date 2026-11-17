#ifndef CJS18_DIALECTS_H
#define CJS18_DIALECTS_H
#include <stddef.h>
/* C11 source-to-source compiler. No Node, JSX compiler or external libraries. */
int cjs18_compile(const char *source, size_t length, char **javascript, size_t *out_length, const char **error);
const char *cjs18_detect(const char *source);
const char *cjs18_version(void);
#endif
