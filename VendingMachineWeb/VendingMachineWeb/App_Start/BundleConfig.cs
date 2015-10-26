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

            Bundle bandle = new ScriptBundle("~/bundles/jquery",
                string.Format("http://code.jquery.com/jquery-{0}.min.js", GetScriptVer(JqueryFileName))).
                Include("~/Scripts/jquery-{version}.js");
            bandle.CdnFallbackExpression = "window.jQuery";
            bundles.Add(bandle);

            bandle = new ScriptBundle("~/bundles/knockoutjs",
                string.Format("http://cdnjs.cloudflare.com/ajax/libs/knockout/{0}/knockout-min.js", GetScriptVer(KnockoutFileName))).
                Include("~/Scripts/knockout-{version}.js");
            bandle.CdnFallbackExpression = "window.ko";
            bundles.Add(bandle);

            bandle = new ScriptBundle("~/bundles/vm-simulator-scripts").
                Include("~/Scripts/VM/wallet.js").
                Include("~/Scripts/VM/goods-store.js").

                Include("~/Scripts/VM/wallet-plugin.js").
                Include("~/Scripts/VM/vending-machine-plugin.js").
                Include("~/Scripts/VM/simulator-app.js");
            
            bundles.Add(bandle);
                        
            /*bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));*/

            bundles.Add(new ScriptBundle("~/bundles/bootstrap",
                "http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js").Include(
                      "~/Scripts/bootstrap.js"));

            bundles.Add(new StyleBundle("~/Content/normalize-css").Include(
                      "~/Content/normalize.css"));

            bundles.Add(new StyleBundle("~/Content/bs-css",
                "http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css").Include(
                      "~/Content/bootstrap.css"));

            bundles.Add(new StyleBundle("~/Content/css").Include(                      
                      "~/Content/site.css"));
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
