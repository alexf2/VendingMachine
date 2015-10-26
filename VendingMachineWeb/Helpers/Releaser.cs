using System;
using System.Threading;

namespace UseTech.Helpers
{
    public sealed class Releaser : IDisposable
    {
        Action _releaseAct;

        public Releaser(Action act)
        {
            _releaseAct = act;
        }

        public void Dispose()
        {
            Action t = Interlocked.Exchange(ref _releaseAct, null);
            if (t != null)
                t();
        }
    }
}
