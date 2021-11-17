// eslint-disable-next-line no-extend-native
Array.prototype.move = function (from, to) {
  const item = this.splice(from, 1)[0];
  return this.splice(to, 0, item);
};

const MY_USER_ID = "2";

export const companion = chat => chat.members.find(c => c?.userId !== MY_USER_ID);

export function multiLevelSort(levels) {
  try {
    console.group("Sorting");
    // coefs of array items
    const coefs = [];

    // calculate item coef depending on received levels with priorities
    const calculateItemCoef = item => {
      const companionName = companion(item)?.nickname;
      const { status } = item;

      const getStringCoef = ({ index, array }) => (array.length - index).toString();

      try {
        // calculate coefs from all levels
        return levels.reduce(
          (p1, c1, i1, a1) => {
            // calculate coef based on all priorities inside a level
            const priority = c1.priorities.reduce(
              (p2, c2, i2, a2) => {
                // get value from current priority callback
                const priorityValue = c2(item);

                const isPriorityValueTruthy = Boolean(priorityValue);

                // check types of priority
                const isPriorityBoolean =
                  typeof priorityValue === "boolean" && isPriorityValueTruthy;
                const isPriorityNumber = typeof priorityValue === "number" && isPriorityValueTruthy;
                const isPriorityString = typeof priorityValue === "string" && isPriorityValueTruthy;

                let currentCoef = "",
                  currentCoefValue = "",
                  currentValue = 0;
                if (isPriorityValueTruthy) {
                  // get stringify number prefix coef based on index of  priority
                  const priorityCoef = getStringCoef({
                    index: i2,
                    array: a2,
                  });

                  // return coef for specific priority type
                  switch (true) {
                    case isPriorityBoolean:
                      currentCoef = priorityCoef;
                      break;
                    case isPriorityNumber:
                      currentCoef = priorityCoef;
                      currentCoefValue = priorityValue.toString();
                      currentValue = priorityValue;
                      break;
                    case isPriorityString:
                      currentCoef = priorityCoef;
                      currentCoefValue = priorityValue.length.toString();
                      currentValue = priorityValue.length;
                      break;
                    default:
                      break;
                  }
                }

                const result = {
                  coef: p2.coef + currentCoef,
                  coefValue: p2.coefValue + currentCoefValue,
                  value: p2.value + currentValue,
                };

                console.log(`priority ${companionName}:`, {
                  p2,
                  i2,
                  a2,
                  companionName,
                  status,
                  result,
                  item,
                  isPriorityBoolean,
                  isPriorityNumber,
                  isPriorityString,
                });

                return result;
              },
              { coef: "", coefValue: "", value: 0 },
            );

            const levelCoef = getStringCoef({ index: i1, array: a1 });
            const isPriorityRecognized = Boolean(Number(priority.coef));
            const coef = p1.coef + levelCoef + priority.coef;
            const coefValue = p1.coefValue + priority.coefValue;
            const value = p1.value + priority.value;

            const result = { coef, coefValue, value };

            console.log(`level - ${companionName}:`, {
              p1,
              priority,
              levelCoef,
              isPriorityRecognized,
              coef,
              coefValue,
              value,
              result,
            });

            return result;
          },
          { coef: "", coefValue: "", value: 0 },
        );
      } catch (error) {
        console.error(error);
        return { coef: "", coefValue: "", value: 0 };
      }
    };

    const sort = () => {
      // iterate through array for sorting
      this.forEach((item, index, array) => {
        const companionName = companion(item)?.nickname;

        const currentCoef = calculateItemCoef(item);
        const currentCoefObj = {
          _name: companionName,
          coef: Number(currentCoef.coef),
          coefValue: Number(currentCoef.coefValue),
          value: Number(currentCoef.value),
        };

        // search for new index depending on saved coefs values
        const searchedIndex = coefs.findIndex(c => {
          const first = c.coef > currentCoefObj.coef;
          const second = c.coefValue > currentCoefObj.coefValue;
          const third = c.value > currentCoefObj.value;

          const result = first && second && third;

          console.log(`searchedIndex - ${companionName}:`, {
            c,
            currentCoefObj,
            first,
            second,
            third,
            result,
          });

          return result;
        });

        // if there is no searchedIndex return Number(0) else return searchedIndex
        const newIndex = searchedIndex >= 0 ? searchedIndex : coefs.length;

        // checking for avoiding unnecessary movings
        const shouldMove = newIndex !== index;

        console.log(`sort - ${companionName}:`, {
          index,
          newIndex,
          currentCoefObj,
          coefs: JSON.parse(JSON.stringify(coefs)),
          searchedIndex,
          status: item.status,
        });

        // save current coeficient
        coefs.splice(newIndex, 0, currentCoefObj);

        if (shouldMove) {
          array.move(index, newIndex);
        }
      });
    };

    sort();
  } catch (error) {
    console.error(error);
  } finally {
    console.groupEnd();
    return this.reverse();
  }
}

// eslint-disable-next-line no-extend-native
Array.prototype.multiLevelSort = multiLevelSort;
