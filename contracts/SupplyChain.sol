// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SupplyChain {
    //Smart Contract owner will be the person who deploys the contract only he can authorize various roles like retailer, Manufacturer,etc
    address public Owner;

    //note this constructor will be called when smart contract will be deployed on blockchain
    constructor() public {
        Owner = msg.sender;
    }

    //Roles (flow of pharma supply chain)
    // RawMaterialSupplier; //This is where Manufacturer will get raw materials to make medicines
    // Manufacturer;  //Various WHO guidelines should be followed by this person
    // Distributor; //This guy distributes the medicines to retailers
    // Retailer; //Normal customer buys from the retailer

    //modifier to make sure only the owner is using the function
    modifier onlyByOwner() {
        require(msg.sender == Owner);
        _;
    }

    //stages of a medicine in pharma supply chain
    enum STAGE {
        Init,
        RawMaterialSupply,
        Manufacture,
        Distribution,
        Retail,
        sold
    }
    //using this we are going to track every single medicine the owner orders

    //Medicine count
    uint256 public medicineCtr = 0;
    //Raw material supplier count
    uint256 public rmsCtr = 0;
    //Manufacturer count
    uint256 public manCtr = 0;
    //distributor count
    uint256 public disCtr = 0;
    //retailer count
    uint256 public retCtr = 0;

    //To store information about the medicine
    struct medicine {
        uint256 id; //unique medicine id
        string name; //name of the medicine
        string description; //about medicine
        uint256 RMSid; //id of the Raw Material supplier for this particular medicine
        uint256 MANid; //id of the Manufacturer for this particular medicine
        uint256 DISid; //id of the distributor for this particular medicine
        uint256 RETid; //id of the retailer for this particular medicine
        STAGE stage; //current medicine stage
    }

    //To store all the medicines on the blockchain
    mapping(uint256 => medicine) public MedicineStock;

    //To show status to client applications
    function showStage(uint256 _medicineID)
        public
        view
        returns (string memory)
    {
        require(medicineCtr > 0);
        if (MedicineStock[_medicineID].stage == STAGE.Init)
            return "Medicine Ordered";
        else if (MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply)
            return "Raw Material Supply Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Manufacture)
            return "Manufacturing Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Distribution)
            return "Distribution Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.Retail)
            return "Retail Stage";
        else if (MedicineStock[_medicineID].stage == STAGE.sold)
            return "Medicine Sold";
    }

    //To store information about raw material supplier
    struct rawMaterialSupplier {
        address addr;
        uint256 id; //supplier id
        string name; //Name of the raw material supplier
        string place; //Place the raw material supplier is based in
        bool isActive; //Status of the supplier (active/inactive)
    }

    //To store all the raw material suppliers on the blockchain
    mapping(uint256 => rawMaterialSupplier) public RMS;
    
    //To check if address is already registered as RMS
    mapping(address => bool) private rmsExists;

    //To store information about manufacturer
    struct manufacturer {
        address addr;
        uint256 id; //manufacturer id
        string name; //Name of the manufacturer
        string place; //Place the manufacturer is based in
        bool isActive; //Status of the manufacturer (active/inactive)
    }

    //To store all the manufacturers on the blockchain
    mapping(uint256 => manufacturer) public MAN;
    
    //To check if address is already registered as Manufacturer
    mapping(address => bool) private manExists;

    //To store information about distributor
    struct distributor {
        address addr;
        uint256 id; //distributor id
        string name; //Name of the distributor
        string place; //Place the distributor is based in
        bool isActive; //Status of the distributor (active/inactive)
    }

    //To store all the distributors on the blockchain
    mapping(uint256 => distributor) public DIS;
    
    //To check if address is already registered as Distributor
    mapping(address => bool) private disExists;

    //To store information about retailer
    struct retailer {
        address addr;
        uint256 id; //retailer id
        string name; //Name of the retailer
        string place; //Place the retailer is based in
        bool isActive; //Status of the retailer (active/inactive)
    }

    //To store all the retailers on the blockchain
    mapping(uint256 => retailer) public RET;
    
    //To check if address is already registered as Retailer
    mapping(address => bool) private retExists;

    //To add raw material suppliers. Only contract owner can add a new raw material supplier
    function addRMS(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner() {
        require(!rmsExists[_address], "This address is already registered as RMS");
        rmsCtr++;
        RMS[rmsCtr] = rawMaterialSupplier(_address, rmsCtr, _name, _place, true);
        rmsExists[_address] = true;
    }

    //To add manufacturer. Only contract owner can add a new manufacturer
    function addManufacturer(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner() {
        require(!manExists[_address], "This address is already registered as Manufacturer");
        manCtr++;
        MAN[manCtr] = manufacturer(_address, manCtr, _name, _place, true);
        manExists[_address] = true;
    }

    //To add distributor. Only contract owner can add a new distributor
    function addDistributor(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner() {
        require(!disExists[_address], "This address is already registered as Distributor");
        disCtr++;
        DIS[disCtr] = distributor(_address, disCtr, _name, _place, true);
        disExists[_address] = true;
    }

    //To add retailer. Only contract owner can add a new retailer
    function addRetailer(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyByOwner() {
        require(!retExists[_address], "This address is already registered as Retailer");
        retCtr++;
        RET[retCtr] = retailer(_address, retCtr, _name, _place, true);
        retExists[_address] = true;
    }

    //To toggle RMS active status. Only contract owner can toggle
    function toggleRMSStatus(uint256 _id) public onlyByOwner() {
        require(_id > 0 && _id <= rmsCtr, "Invalid RMS ID");
        RMS[_id].isActive = !RMS[_id].isActive;
    }

    //To toggle Manufacturer active status. Only contract owner can toggle
    function toggleManufacturerStatus(uint256 _id) public onlyByOwner() {
        require(_id > 0 && _id <= manCtr, "Invalid Manufacturer ID");
        MAN[_id].isActive = !MAN[_id].isActive;
    }

    //To toggle Distributor active status. Only contract owner can toggle
    function toggleDistributorStatus(uint256 _id) public onlyByOwner() {
        require(_id > 0 && _id <= disCtr, "Invalid Distributor ID");
        DIS[_id].isActive = !DIS[_id].isActive;
    }

    //To toggle Retailer active status. Only contract owner can toggle
    function toggleRetailerStatus(uint256 _id) public onlyByOwner() {
        require(_id > 0 && _id <= retCtr, "Invalid Retailer ID");
        RET[_id].isActive = !RET[_id].isActive;
    }

    //To supply raw materials from RMS supplier to the manufacturer
    function RMSsupply(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "RMSsupply: Invalid Medicine ID");
        uint256 _id = findRMS(msg.sender);
        require(_id > 0, "RMSsupply: Caller is not a registered RMS");
        require(RMS[_id].isActive, "RMSsupply: Your account is deactivated");
        require(MedicineStock[_medicineID].stage == STAGE.Init, "RMSsupply: Medicine not in Init stage");
        MedicineStock[_medicineID].RMSid = _id;
        MedicineStock[_medicineID].stage = STAGE.RawMaterialSupply;
    }

    //To check if RMS is available and active in the blockchain
    function findRMS(address _address) private view returns (uint256) {
        require(rmsCtr > 0);
        for (uint256 i = 1; i <= rmsCtr; i++) {
            if (RMS[i].addr == _address) return RMS[i].id;
        }
        return 0;
    }

    //To manufacture medicine
    function Manufacturing(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Manufacturing: Invalid Medicine ID");
        uint256 _id = findMAN(msg.sender);
        require(_id > 0, "Manufacturing: Caller is not a registered Manufacturer");
        require(MAN[_id].isActive, "Manufacturing: Your account is deactivated");
        require(MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply, "Manufacturing: Medicine not in RawMaterialSupply stage");
        MedicineStock[_medicineID].MANid = _id;
        MedicineStock[_medicineID].stage = STAGE.Manufacture;
    }

    //To check if Manufacturer is available and active in the blockchain
    function findMAN(address _address) private view returns (uint256) {
        require(manCtr > 0);
        for (uint256 i = 1; i <= manCtr; i++) {
            if (MAN[i].addr == _address) return MAN[i].id;
        }
        return 0;
    }

    //To supply medicines from Manufacturer to distributor
    function Distribute(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Distribute: Invalid Medicine ID");
        uint256 _id = findDIS(msg.sender);
        require(_id > 0, "Distribute: Caller is not a registered Distributor");
        require(DIS[_id].isActive, "Distribute: Your account is deactivated");
        require(MedicineStock[_medicineID].stage == STAGE.Manufacture, "Distribute: Medicine not in Manufacture stage");
        MedicineStock[_medicineID].DISid = _id;
        MedicineStock[_medicineID].stage = STAGE.Distribution;
    }

    //To check if distributor is available and active in the blockchain
    function findDIS(address _address) private view returns (uint256) {
        require(disCtr > 0);
        for (uint256 i = 1; i <= disCtr; i++) {
            if (DIS[i].addr == _address) return DIS[i].id;
        }
        return 0;
    }

    //To supply medicines from distributor to retailer
    function Retail(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Retail: Invalid Medicine ID");
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Retail: Caller is not a registered Retailer");
        require(RET[_id].isActive, "Retail: Your account is deactivated");
        require(MedicineStock[_medicineID].stage == STAGE.Distribution, "Retail: Medicine not in Distribution stage");
        MedicineStock[_medicineID].RETid = _id;
        MedicineStock[_medicineID].stage = STAGE.Retail;
    }

    //To check if retailer is available and active in the blockchain
    function findRET(address _address) private view returns (uint256) {
        require(retCtr > 0);
        for (uint256 i = 1; i <= retCtr; i++) {
            if (RET[i].addr == _address) return RET[i].id;
        }
        return 0;
    }

    //To sell medicines from retailer to consumer
    function sold(uint256 _medicineID) public {
        require(_medicineID > 0 && _medicineID <= medicineCtr, "Sold: Invalid Medicine ID");
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Sold: Caller is not a registered Retailer");
        require(RET[_id].isActive, "Sold: Your account is deactivated");
        require(_id == MedicineStock[_medicineID].RETid, "Sold: Caller is not the assigned Retailer for this medicine"); 
        require(MedicineStock[_medicineID].stage == STAGE.Retail, "Sold: Medicine not in Retail stage");
        MedicineStock[_medicineID].stage = STAGE.sold;
    }

    // To add new medicines to the stock
    function addMedicine(string memory _name, string memory _description)
        public
        onlyByOwner()
    {
        require((rmsCtr > 0) && (manCtr > 0) && (disCtr > 0) && (retCtr > 0));
        medicineCtr++;
        MedicineStock[medicineCtr] = medicine(
            medicineCtr,
            _name,
            _description,
            0,
            0,
            0,
            0,
            STAGE.Init
        );
    }
}
