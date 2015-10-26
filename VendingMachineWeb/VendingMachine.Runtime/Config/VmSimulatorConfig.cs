using System;
using System.Configuration;
using System.Xml;
using System.Xml.Serialization;

namespace UseTech.VendingMachine.Runtime.Config
{
    /// <summary>
    /// Represents Vending Machine simulator initial configuration section for retrieving off App.config or Web.config.
    /// </summary>
    public sealed class VmSimulatorConfig : IConfigurationSectionHandler
    {
        #region Declaratiobs
        public struct MoneyItem
        {
            [XmlAttribute(AttributeName="nominal")]
            public decimal Nominal { get; set; }

            [XmlAttribute(AttributeName="amount")]
            public long Amount { get; set; }
        }

        public struct Good
        {
            [XmlAttribute(AttributeName="name")]
            public string Name { get; set; }
        
            [XmlAttribute(AttributeName="price")]
            public decimal Price { get; set; }
        
            [XmlAttribute(AttributeName="count-pcs")]
            public long CountInPieces { get; set; }
        }

        public struct Wallet
        {
            [XmlAttribute(AttributeName="name")]
            public string Name { get; set; }

            [XmlElement("MoneyItem")]
            public MoneyItem[] Items
            {
                get;
                set;
            }
        }

        public struct VM
        {
            [XmlAttribute(AttributeName="name")]
            public string Name { get; set; }

            [XmlAttribute(AttributeName = "wallet-ref")]
            public string WalletRef { get; set; }
            
            public Good[] Goods
            {
                get;
                set;
            }
        }
        #endregion Declaratiobs

        private static readonly VmSimulatorConfig _instance;
        static VmSimulatorConfig()
        {
            _instance = (VmSimulatorConfig)ConfigurationManager.GetSection("ApplicationConfigGroup/VmSimulatorConfig");
        }

        public static VmSimulatorConfig Instance
        {
            get { return _instance; }
        }

        #region IConfigurationSectionHandler
        Object IConfigurationSectionHandler.Create(Object parent, Object confCtx, XmlNode section)
        {
            var ser = new XmlSerializer(typeof(VmSimulatorConfig));
            return ser.Deserialize(new XmlNodeReader(section));
        }
        #endregion IConfigurationSectionHandler

        public Wallet[] Wallets { get; set; }
        public VM[] VendingMachines  { get; set; }
    }
}

