<?php
/**
 * Template Job 
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 */
namespace Mirsa\Bundle\MirsaBundle\Entity;

use Doctrine\ORM\Mapping as ORM,
    Symfony\Component\Validator\Constraints as Assert,
    JMS\Serializer\Annotation as Serializer,
    FSC\HateoasBundle\Annotation as RestHateoas;

/**
 * Job Inspection Template
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://webserver:8090/display/BMAN/Portal+Documentation
 *
 * @ORM\Entity()
 * @ORM\Table(name="Template_Jobs")
 *
 * @Serializer\XmlRoot("job")
 * @Serializer\ExclusionPolicy("all")
 *
 */
class WorkOrderTemplate
{
    /**
     * Primary Key
     *
     * @ORM\Id
     * @ORM\Column(name="`__kp_Template_Job_ID`", type="integer")
     * @Serializer\Expose
     * @Serializer\XmlAttribute
     */
    protected $id;

    /**
     * Description
     *
     * @ORM\Column(name="Template_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $templateName;
   
    /**
     * @ORM\Column(name="Customer_Account_No", type="string")
     * @Serializer\Expose
     */
    protected $customerAccountNumber;    
    
    /**
     * Customer Name
     *
     * @ORM\Column(name="Customer_Name", type="string")
     * @Serializer\Expose
     * @Serializer\Type("string")
     */
    protected $customerName;
    
    /**
     * @ORM\Column(name="Custom_Label1", type="string")
     * @Serializer\Expose
     */
    protected $customLabel1;

    /**
     * @ORM\Column(name="Custom_Label2", type="string")
     * @Serializer\Expose
     */
    protected $customLabel2;

    /**
     * @ORM\Column(name="Custom_Label3", type="string")
     * @Serializer\Expose
     */
    protected $customLabel3;

    /**
     * @ORM\Column(name="Custom_Label4", type="string")
     * @Serializer\Expose
     */
    protected $customLabel4;
    
    /**
     * @ORM\Column(name="Custom_Label5", type="string")
     * @Serializer\Expose
     */
    protected $customLabel5;

    /**
     * @ORM\Column(name="Custom_Label6", type="string")
     * @Serializer\Expose
     */
    protected $customLabel6;
    
    /**
     * @ORM\Column(name="Custom_Label7", type="string")
     * @Serializer\Expose
     */
    protected $customLabel7;

    /**
     * @ORM\Column(name="Custom_Label8", type="string")
     * @Serializer\Expose
     */
    protected $customLabel8;
    
    /**
     * @ORM\Column(name="Custom_Label9", type="string")
     * @Serializer\Expose
     */
    protected $customLabel9;

    /**
     * @ORM\Column(name="Custom_Label10", type="string")
     * @Serializer\Expose
     */
    protected $customLabel10;
    
    function getId() {
        return $this->id;
    }

    function getTemplateName() {
        return $this->templateName;
    }
    function getCustomerAccountNumber() {
        return $this->customerAccountNumber;
    }

        function getCustomerName() {
        return $this->customerName;
    }
    
    function getCustomLabel1() {
        return $this->customLabel1;
    }

    function getCustomLabel2() {
        return $this->customLabel2;
    }

    function getCustomLabel3() {
        return $this->customLabel3;
    }

    function getCustomLabel4() {
        return $this->customLabel4;
    }

    function getCustomLabel5() {
        return $this->customLabel5;
    }

    function getCustomLabel6() {
        return $this->customLabel6;
    }

    function getCustomLabel7() {
        return $this->customLabel7;
    }

    function getCustomLabel8() {
        return $this->customLabel8;
    }

    function getCustomLabel9() {
        return $this->customLabel9;
    }

    function getCustomLabel10() {
        return $this->customLabel10;
    }
    
}