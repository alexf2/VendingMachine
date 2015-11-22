using System;
using System.Text.RegularExpressions;
using System.Web.Hosting;
using System.Web.Optimization;

namespace UseTech.VendingMachine.Web
{
    /// <summary>
    /// Implements script and CSS bundles configuration.
    /// </summary>
    public sealed class BundleConfig
    {
        const string JqueryFileName = "~/Scripts/jquery*.js";
        const string KnockoutFileName = "~/Scripts/knockout*.js";
        
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.UseCdn = true;

            var bundle = new ScriptBundle("~/bundles/require.js", 
                "http://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.22/require.min.js").Include("~/Scripts/require.js");
            bundle.CdnFallbackExpression = "(typeof define === 'function') && define['amd']";
            bundles.Add(bundle);

            bundle = new ScriptBundle("~/bundles/jquery.js",
                string.Format("http://code.jquery.com/jquery-{0}.min.js", GetScriptVer(JqueryFileName))).
                Include("~/Scripts/jquery-{version}.js");
            bundle.CdnFallbackExpression = "window.jQuery";
            bundles.Add(bundle);

            bundle = new ScriptBundle("~/bundles/knockout.js",
                string.Format("http://cdnjs.cloudflare.com/ajax/libs/knockout/{0}/knockout-min.js", GetScriptVer(KnockoutFileName))).
                Include("~/Scripts/knockout-{version}.js");
            bundle.CdnFallbackExpression = "window.ko";
            bundles.Add(bundle);

            bundles.Add(new ScriptBundle("~/bundles/bootstrap.js",
                "http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js").Include(
                      "~/Scripts/bootstrap.js"));

            bundles.Add(new ScriptBundle("~/bundles/vm-simulator-scripts.js").
                Include("~/Scripts/VM/wallet.js").
                Include("~/Scripts/VM/goods-store.js").
                Include("~/Scripts/VM/purcashing-result.js").

                Include("~/Scripts/VM/wallet-plugin.js").
                Include("~/Scripts/VM/vending-machine-plugin.js").
                Include("~/Scripts/VM/simulator-app.js"));

            #region CSS bundles
            bundles.Add(new StyleBundle("~/Content/normalize-css",
                "http://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.2/normalize.min.css").Include(
                      "~/Content/normalize.css"));

            bundles.Add(new StyleBundle("~/Content/bs-css",
                "http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css").Include(
                      "~/Content/bootstrap.css"));

            bundles.Add(new StyleBundle("~/Content/site-css").Include(                      
                      "~/Content/site.css"));
            #endregion CSS bundles
        }

        static string _bust;
        public static string Bust
        {
            get { return _bust ?? (_bust = "v=" + typeof (AppInstaller).Assembly.GetName().Version); }
        }

        static readonly Regex _exParseVer = new Regex(@"\d+\.(\d+\.)*", RegexOptions.CultureInvariant | RegexOptions.Singleline);

        static string GetScriptVer(string filePattern)
        {
            if (!BundleTable.VirtualPathProvider.FileExists(filePattern))
            {
                VirtualFile f = BundleTable.VirtualPathProvider.GetFile(filePattern);

                Match m = _exParseVer.Match(f.Name);
                if (!m.Success)
                    throw new Exception(string.Format("Can't extract version: {0}", f.Name));

                string res = m.Groups[0].Value;

                return res.EndsWith(".") ? res.Substring(0, res.Length - 1) : res;
            }
            else
            {
                throw new Exception(string.Format("Can't find {0}", filePattern));
            }
        }
    }
}
