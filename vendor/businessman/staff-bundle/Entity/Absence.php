<?php
namespace BusinessMan\Bundle\StaffBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Absence
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/StaffBundle
 *
 * @ORM\Entity()
 * @ORM\Table(name="Staff_Absence")
 */
class Absence
{
    /**
     * @var string
     *
     * @ORM\Id
     * @ORM\Column(name="Record_ID", type="string")
     * @ORM\GeneratedValue(strategy="CUSTOM")
     * @ORM\CustomIdGenerator(class="Synergize\Bundle\DbalBundle\Driver\IdentityGenerator")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(name="Absence_Type", type="string")
     */
    protected $type;

    /**
     * @var string
     *
     * @ORM\Column(name="Authorised", type="string")
     */
    protected $authorised;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Date_Absent_From", type="date")
     */
    protected $from;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Date_Absent_To", type="date")
     */
    protected $to;

    /**
     * @var array|\DateTime
     *
     * @ORM\Column(name="Company_Holidays_List", type="date_list")
     */
    protected $holidays;

    /**
     * @var Staff
     *
     * @ORM\ManyToOne(targetEntity="Staff", inversedBy="absences")
     * @ORM\JoinColumn(name="Key_Staff_ID", referencedColumnName="Staff_ID")
     */
    protected $staff;

    public function getWorkingDays()
    {
        $workingDays = array();
        $current = $this->getFrom();

        while ($current <= $this->getTo()) {
            $exclude = false;
            $weekday = $current->format('w');

            // Exclude if weekend
            if ($weekday == 0 || $weekday == 6) {
                $exclude = true;
            }

            // Check if company holiday
            foreach ($this->getHolidays() as $holiday) {
                if ($current->format('Y-m-d') == $holiday->format('Y-m-d')) {
                    $exclude = true;
                }
            }

            if (!$exclude) {
                $workingDays[] = clone $current;
            }

            $current->modify('+1 day');
        }

        return $workingDays;
    }

    /**
     * @return string
     */
    public function getAuthorised()
    {
        return $this->authorised;
    }

    /**
     * @return \DateTime
     */
    public function getFrom()
    {
        return $this->from;
    }

    /**
     * @return array|\DateTime
     */
    public function getHolidays()
    {
        return $this->holidays;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return \BusinessMan\Bundle\StaffBundle\Entity\Staff
     */
    public function getStaff()
    {
        return $this->staff;
    }

    /**
     * @return \DateTime
     */
    public function getTo()
    {
        return $this->to;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param string $authorised
     */
    public function setAuthorised($authorised)
    {
        $this->authorised = $authorised;
    }

    /**
     * @param \DateTime $from
     */
    public function setFrom($from)
    {
        $this->from = $from;
    }

    /**
     * @param \BusinessMan\Bundle\StaffBundle\Entity\Staff $staff
     */
    public function setStaff($staff)
    {
        $this->staff = $staff;
    }

    /**
     * @param \DateTime $to
     */
    public function setTo($to)
    {
        $this->to = $to;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }
}
