from web3 import Web3, TestRPCProvider
from solc import compile_source
from web3.contract import ConciseContract
import json
import time

class eth(object):

    def __init__(self):

        self.web3 = Web3(Web3.HTTPProvider("https://kovan.infura.io/Wq3Bynrr8b0CO6bO0YVG"))
        self.firstAccount = '0x8398e9D9651d2695D3622F9E1266E3901Ba3C1DD'
        self.firstAccountPK = '269f30fb2e8cad8c03229f33875c8d38e1989df49a6824d680ea98974e38c695'
        self.secondAccount = '0x98EaCBa30A42B5Decd6A16cBa79AEBa8245F8C4c'
        self.secondAccountPK = '8b8385373441bf626108ebc7fd0b46411ed6c247a0588e05ae96e82cc4c05b68'
        self.beneficiary = '0x5dffcB745205962c70957cfa43f4CC045328a093'
        self.CrowdsaleAddress = '0x7f41C30f4e99aA944e2220443Bf604DF347C9cD8'
        self.ChozunCoinAddress = '0xfD764B0f1f6737B79C83D6A2b9e9A8832dB7CC77'
        self.logfile = open("logfile.txt", 'w')

        ''' You must use sendRawTransaction() when working with local keys, instead of sendTransaction() .'''
        '''Need to copy deployed contracts APIS into abi files'''

    def deploy(self):
        print("Yah")
        print(self.web3.eth.getTransactionCount(self.firstAccount))
        print("Blah")
        compiled_sol = json.load(open('contracts/ChozunCoin.json'))
        compiled_sol = compile_source(open('contracts/ChozunCoin.sol').read())  # Compiled source code
        contract_interface = compiled_sol['<stdin>:ChozunCoin']
        nonce = self.web3.eth.getTransactionCount(self.firstAccount)

        print(self.web3.eth.coinbase)


        # deploy_contracy = Contract.constructor()
        contract = self.web3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin']).transact()


        contract = self.web3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])
        # contract = self.web3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bytecode'])
        tx_hash = contract.deploy(transaction={'from': self.firstAccount, 'gas': 4100000})
        tx_receipt = self.web3.eth.getTransactionReceipt(tx_hash)
        self.ChozunCoinAddress = tx_receipt['contractAddress']
        self.ChozunCoin = self.web3.eth.contract(abi=contract_interface['abi'], address=self.ChozunCoinAddress,
                                            ContractFactoryClass=ConciseContract)


        print(self.web3.eth.getTransactionCount(self.firstAccount))
        compiled_sol = json.load(open('contracts/Crowdsale.json'))
        # compiled_sol = compile_source(contract_source_code)  # Compiled source code
        # contract_interface = compiled_sol['<stdin>:ChozunCoin']
        contract_interface = compiled_sol
        # contract = self.web3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])
        contract = self.web3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bytecode'])
        tx_hash = contract.deploy(transaction={'from': self.firstAccount, 'gas': 41000000})
        tx_receipt = self.web3.eth.getTransactionReceipt(tx_hash)
        self.CrowdsaleAddress = tx_receipt['contractAddress']
        self.Crowdsale = self.web3.eth.contract(abi=contract_interface['abi'], address=self.CrowdsaleAddress,
                                            ContractFactoryClass=ConciseContract)

    def init_contracts(self):

        contract_interface = json.load(open('contracts/ChozunCoin.json'))
        self.ChozunCoin = self.web3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bytecode'], address=self.ChozunCoinAddress)
        contract_interface = json.load(open('contracts/Crowdsale.json'))
        self.Crowdsale = self.web3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bytecode'], address=self.CrowdsaleAddress)

    def fillCrowdsale(self, account, privatekey):

        nonce = self.web3.eth.getTransactionCount(account)
        txn = self.ChozunCoin.functions.transfer(self.CrowdsaleAddress, 5000000000000000000000000).buildTransaction({
         # 'chainId': 1,
         'gas': 70000,
         'gasPrice': self.web3.toWei('1', 'gwei'),
         'nonce': nonce,
        })
        signed_txn = self.web3.eth.account.signTransaction(txn, private_key=privatekey)
        print(self.web3.toHex(self.web3.eth.sendRawTransaction(signed_txn.rawTransaction)))

    def tokenBalance(self, account):

        print(self.ChozunCoin.call().balanceOf(account))

    def crowdsaleTokenBalance(self):

        print("Crowdsale tokenBalance: " + str(self.Crowdsale.call().tokenBalance()))
        print("offChainTokens: " + str(self.Crowdsale.call().offChainTokens()))
        print("AccountBalance: " + str(self.Crowdsale.call().balanceOf(self.secondAccount)))

    def readContractVars(self):

        print("Off chain tokens: " + str(self.Crowdsale.call().offChainTokens()))
        print("paused: " + str(self.Crowdsale.call().paused()))
        print("dollarRate: " + str(self.Crowdsale.call().dollarRate()))
        print("contributors: " + str(self.Crowdsale.call().contributors(0)))
        # print("contributors: " + str(self.Crowdsale.call().contributors(1)))

    def updateOffChainTokens(self, amount, account, privatekey):

        nonce = self.web3.eth.getTransactionCount(account)
        txn = self.Crowdsale.functions.updateOffChainTokens(amount).buildTransaction({
            # 'chainId': 1,
         'gas': 70000,
         'gasPrice': self.web3.toWei('3', 'gwei'),
         'nonce': nonce,
         'from': self.firstAccount
        })
        signed_txn = self.web3.eth.account.signTransaction(txn, private_key=privatekey)
        # print(self.web3.toHex(self.web3.eth.sendRawTransaction(signed_txn.rawTransaction)))
        receipt = self.web3.eth.sendRawTransaction(signed_txn.rawTransaction)
        # time.sleep(10)
        self.logfile.write("\nupdate_offchain_tokens\n" + str(self.web3.eth.getTransactionReceipt(receipt)))

    def pause(self, account, privatekey):

        nonce = self.web3.eth.getTransactionCount(account)
        txn = self.Crowdsale.functions.pause().buildTransaction({
            # 'chainId': 1,
         'gas': 7000000,
         'gasPrice': self.web3.toWei('3', 'gwei'),
         'nonce': nonce,
         # 'from': self.firstAccount
        })
        signed_txn = self.web3.eth.account.signTransaction(txn, private_key=privatekey)
        # receipt = self.web3.toHex(self.web3.eth.sendRawTransaction(signed_txn.rawTransaction))
        receipt = self.web3.eth.sendRawTransaction(signed_txn.rawTransaction)
        # time.sleep(10)
        self.logfile.write("\nPause\n" + str(self.web3.eth.getTransactionReceipt(receipt)))

    def unPause(self, account, privatekey):

        nonce = self.web3.eth.getTransactionCount(account)
        txn = self.Crowdsale.functions.unPause().buildTransaction({
            # 'chainId': 1,
         'gas': 7000000,
         'gasPrice': self.web3.toWei('3', 'gwei'),
         'nonce': nonce,
         # 'from': self.firstAccount
        })
        signed_txn = self.web3.eth.account.signTransaction(txn, private_key=privatekey)
        # receipt = self.web3.toHex(self.web3.eth.sendRawTransaction(signed_txn.rawTransaction))
        receipt = self.web3.eth.sendRawTransaction(signed_txn.rawTransaction)
        # time.sleep(10)
        self.logfile.write("\nunPause\n" + str(self.web3.eth.getTransactionReceipt(receipt)))

    def withdrawFunds(self, account, privatekey):

        '''Just for testing purpoes - does not need to be in file'''
        nonce = self.web3.eth.getTransactionCount(account)
        txn = self.Crowdsale.functions.safeWithdrawal().buildTransaction({
            # 'chainId': 1,
         'gas': 7000000,
         'gasPrice': self.web3.toWei('3', 'gwei'),
         'nonce': nonce,
         # 'from': self.firstAccount
        })
        signed_txn = self.web3.eth.account.signTransaction(txn, private_key=privatekey)
        # receipt = self.web3.toHex(self.web3.eth.sendRawTransaction(signed_txn.rawTransaction))
        receipt = self.web3.eth.sendRawTransaction(signed_txn.rawTransaction)
        # time.sleep(10)
        self.logfile.write("\nwithdrawFunds\n" + str(self.web3.eth.getTransactionReceipt(receipt)))

    def tokenPayout(self, account, privatekey):

        '''Just for testing purpoes - does not need to be in file'''
        nonce = self.web3.eth.getTransactionCount(account)
        txn = self.Crowdsale.functions.tokenPayout().buildTransaction({
            # 'chainId': 1,
         'gas': 7000000,
         'gasPrice': self.web3.toWei('1', 'gwei'),
         'nonce': nonce,
         # 'from': self.firstAccount
        })
        signed_txn = self.web3.eth.account.signTransaction(txn, private_key=privatekey)
        # receipt = self.web3.toHex(self.web3.eth.sendRawTransaction(signed_txn.rawTransaction))
        receipt = self.web3.eth.sendRawTransaction(signed_txn.rawTransaction)
        time.sleep(10)
        self.logfile.write("\ntokenPayout\n" + str(self.web3.eth.getTransactionReceipt(receipt)))

    def updateDollarRate(self, account, privatekey, rate):

        '''Just for testing purpoes - does not need to be in file'''
        nonce = self.web3.eth.getTransactionCount(account)
        txn = self.Crowdsale.functions.updateDollarRate(rate).buildTransaction({
            # 'chainId': 1,
         'gas': 7000000,
         'gasPrice': self.web3.toWei('3', 'gwei'),
         'nonce': nonce,
         # 'from': self.firstAccount
        })
        signed_txn = self.web3.eth.account.signTransaction(txn, private_key=privatekey)
        # receipt = self.web3.toHex(self.web3.eth.sendRawTransaction(signed_txn.rawTransaction))
        receipt = self.web3.eth.sendRawTransaction(signed_txn.rawTransaction)
        # time.sleep(10)
        self.logfile.write("\nupdateDollarRate\n" + str(self.web3.eth.getTransactionReceipt(receipt)))

    def checkTransaction(self):

        print(self.web3.eth.getTransactionReceipt("0x8b971be53df7e5ae5a2de825e14624a93ccd934165f4e7473544ff2dcd6afa5c"))


    def sendEther(self):

        self.web3.eth.sendTransaction({'from': self.secondAccount, 'to': self.firstAccount, 'gasPrice': self.web3.toWei(0.001, 'ether')})

Eth = eth()
Eth.init_contracts()

# Eth.fillCrowdsale(Eth.firstAccount, Eth.firstAccountPK)
# Eth.tokenPayout(Eth.firstAccount, Eth.firstAccountPK)
Eth.withdrawFunds(Eth.firstAccount, Eth.firstAccountPK)
print("need callback or something to say transaction went through")
Eth.tokenBalance(Eth.CrowdsaleAddress)
Eth.tokenBalance(Eth.firstAccount)
Eth.tokenBalance(Eth.secondAccount)
Eth.tokenBalance(Eth.beneficiary)
Eth.crowdsaleTokenBalance()
Eth.readContractVars()
# Eth.update_offchain_tokens(10000, Eth.firstAccount, Eth.firstAccountPK)
# Eth.pause(Eth.firstAccount, Eth.firstAccountPK)
# Eth.unPause(Eth.firstAccount, Eth.firstAccountPK)
# Eth.updateDollarRate(Eth.firstAccount, Eth.firstAccountPK, 300)     #after this have to check sending eth to contract works - try with varying exchange rate
# Eth.readContractVars()
# Eth.sendEther()

